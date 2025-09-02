/**
 * Service de Inativação Automática de Produtos - RF0013
 * Inativa produtos sem estoque e com vendas abaixo do parâmetro de preço
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

interface InactivationConfig {
  daysWithoutSales: number;
  minPriceThreshold: number;
  zeroStockOnly: boolean;
  dryRun: boolean;
}

export class ProductInactivationService {

  private defaultConfig: InactivationConfig = {
    daysWithoutSales: 90,     // 3 meses sem vendas
    minPriceThreshold: 10.00, // R$10,00 valor mínimo
    zeroStockOnly: true,      // Apenas produtos com estoque zerado
    dryRun: false            // Executar de verdade
  };

  /**
   * RF0013 - Inativar produtos automaticamente baseado em critérios
   */
  public async inactivateProducts(config?: Partial<InactivationConfig>) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    console.log('[INACTIVATION] Iniciando processo de inativação automática...');
    console.log('[INACTIVATION] Configuração:', finalConfig);

    try {
      // 1. Buscar produtos candidatos à inativação
      const candidates = await this.findInactivationCandidates(finalConfig);
      
      if (candidates.length === 0) {
        console.log('[INACTIVATION] Nenhum produto encontrado para inativação');
        return {
          success: true,
          processed: 0,
          inactivated: 0,
          message: 'Nenhum produto necessita inativação'
        };
      }

      console.log(`[INACTIVATION] Encontrados ${candidates.length} produtos candidatos à inativação`);

      // 2. Processar inativação
      let inactivated = 0;
      const results = [];

      for (const product of candidates) {
        try {
          const analysis = await this.analyzeProductForInactivation(product, finalConfig);
          
          if (analysis.shouldInactivate) {
            if (!finalConfig.dryRun) {
              await this.inactivateProduct(product, analysis.reason);
              inactivated++;
            }
            
            results.push({
              productId: product.id,
              title: product.title,
              action: finalConfig.dryRun ? 'WOULD_INACTIVATE' : 'INACTIVATED',
              reason: analysis.reason,
              lastSaleDate: analysis.lastSaleDate,
              daysSinceLastSale: analysis.daysSinceLastSale
            });
          }
        } catch (error) {
          console.error(`[INACTIVATION] Erro ao processar produto ${product.id}:`, error);
          results.push({
            productId: product.id,
            title: product.title,
            action: 'ERROR',
            reason: error.message
          });
        }
      }

      // 3. Registrar log de auditoria
      await this.logInactivationProcess({
        config: finalConfig,
        totalCandidates: candidates.length,
        totalInactivated: inactivated,
        results,
        dryRun: finalConfig.dryRun
      });

      console.log(`[INACTIVATION] Processo concluído - ${inactivated} produtos inativados`);

      return {
        success: true,
        processed: candidates.length,
        inactivated: inactivated,
        results,
        message: finalConfig.dryRun 
          ? `Simulação: ${inactivated} produtos seriam inativados`
          : `${inactivated} produtos inativados com sucesso`
      };

    } catch (error) {
      console.error('[INACTIVATION] Erro no processo de inativação:', error);
      throw error;
    }
  }

  /**
   * Buscar produtos candidatos à inativação
   */
  private async findInactivationCandidates(config: InactivationConfig) {
    const filters: any = {
      active: true // Apenas produtos ativos
    };

    // Filtrar por estoque se configurado
    if (config.zeroStockOnly) {
      filters.stock = { $lte: 0 };
    }

    // Filtrar por preço baixo
    if (config.minPriceThreshold > 0) {
      filters.priceSell = { $lt: config.minPriceThreshold };
    }

    const products = await strapi.entityService.findMany('api::product.product', {
      filters,
      populate: {
        cartOrders: {
          populate: {
            purchase: {
              fields: ['date', 'purchaseStatus']
            }
          }
        }
      }
    });

    return products;
  }

  /**
   * Analisar se produto deve ser inativado
   */
  private async analyzeProductForInactivation(product: any, config: InactivationConfig) {
    const reasons = [];
    let lastSaleDate = null;
    let daysSinceLastSale = Infinity;

    // 1. Verificar se tem estoque zerado
    if (product.stock <= 0) {
      reasons.push(`Estoque zerado (${product.stock})`);
    }

    // 2. Verificar preço baixo
    if (product.priceSell < config.minPriceThreshold) {
      reasons.push(`Preço baixo (R$${product.priceSell.toFixed(2)} < R$${config.minPriceThreshold.toFixed(2)})`);
    }

    // 3. Verificar vendas recentes
    if (product.cartOrders && product.cartOrders.length > 0) {
      // Encontrar a venda mais recente aprovada
      const recentSales = product.cartOrders
        .filter((order: any) => order.purchase && ['APROVADA', 'EM_TRANSITO', 'ENTREGUE'].includes(order.purchase.purchaseStatus))
        .map((order: any) => new Date(order.purchase.date))
        .sort((a: Date, b: Date) => b.getTime() - a.getTime());

      if (recentSales.length > 0) {
        lastSaleDate = recentSales[0];
        daysSinceLastSale = Math.floor((Date.now() - lastSaleDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    // 4. Determinar se deve inativar
    const noRecentSales = daysSinceLastSale >= config.daysWithoutSales;
    const hasLowPrice = product.priceSell < config.minPriceThreshold;
    const hasZeroStock = product.stock <= 0;

    const shouldInactivate = noRecentSales && hasLowPrice && (config.zeroStockOnly ? hasZeroStock : true);

    if (noRecentSales) {
      reasons.push(`Sem vendas há ${daysSinceLastSale} dias (limite: ${config.daysWithoutSales})`);
    }

    return {
      shouldInactivate,
      reason: reasons.join('; '),
      lastSaleDate,
      daysSinceLastSale,
      hasZeroStock,
      hasLowPrice,
      noRecentSales
    };
  }

  /**
   * Inativar produto específico
   */
  private async inactivateProduct(product: any, reason: string) {
    await strapi.entityService.update('api::product.product', product.id, {
      data: {
        active: false,
        inactivatedAt: new Date(),
        inactivationReason: reason,
        inactivationType: 'AUTOMATIC'
      }
    });

    console.log(`[INACTIVATION] Produto inativado - ID: ${product.id}, Título: ${product.title}`);
  }

  /**
   * Registrar processo de inativação no log de auditoria
   */
  private async logInactivationProcess(data: any) {
    try {
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'UPDATE',
          entityName: 'product-inactivation-process',
          entityId: `batch-${Date.now()}`,
          userId: null,
          userEmail: 'system@auto-inactivation',
          oldData: null,
          newData: {
            processType: 'AUTOMATIC_INACTIVATION',
            config: data.config,
            totalCandidates: data.totalCandidates,
            totalInactivated: data.totalInactivated,
            results: data.results,
            executedAt: new Date().toISOString(),
            dryRun: data.dryRun
          } as any,
          changedFields: ['product.active'],
          timestamp: new Date(),
          ipAddress: 'system',
          userAgent: 'auto-inactivation-service'
        }
      });

      console.log('[INACTIVATION] Log de auditoria registrado com sucesso');
    } catch (error) {
      console.error('[INACTIVATION] Erro ao registrar log de auditoria:', error);
    }
  }

  /**
   * Obter estatísticas de produtos para inativação
   */
  public async getInactivationStats() {
    const totalProducts = await strapi.entityService.count('api::product.product');
    const activeProducts = await strapi.entityService.count('api::product.product', {
      filters: { active: true }
    });
    const zeroStockProducts = await strapi.entityService.count('api::product.product', {
      filters: { active: true, stock: { $lte: 0 } }
    });
    const lowPriceProducts = await strapi.entityService.count('api::product.product', {
      filters: { active: true, priceSell: { $lt: this.defaultConfig.minPriceThreshold } }
    });

    // Simular inativação para obter candidatos
    const simulation = await this.inactivateProducts({ 
      ...this.defaultConfig, 
      dryRun: true 
    });

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      zeroStockProducts,
      lowPriceProducts,
      inactivationCandidates: simulation.processed,
      config: this.defaultConfig
    };
  }

  /**
   * Executar inativação via cron/scheduler
   */
  public async runScheduledInactivation() {
    console.log('[SCHEDULER] Executando inativação automática programada...');
    
    try {
      const result = await this.inactivateProducts({
        dryRun: false
      });

      console.log('[SCHEDULER] Inativação automática concluída:', result.message);
      return result;
    } catch (error) {
      console.error('[SCHEDULER] Erro na inativação automática programada:', error);
      throw error;
    }
  }
}