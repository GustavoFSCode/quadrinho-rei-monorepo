/**
 * Service de Cálculo Automático de Preço - RF0052
 * Calcula preço de venda baseado em custo + margem do grupo de precificação
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface PricingRule {
  id: string;
  name: string;
  marginPercentage: number;
  minimumMargin: number;
  maximumMargin: number;
  isActive: boolean;
  category?: string;
  priority: number;
}

export interface PriceCalculation {
  costPrice: number;
  marginPercentage: number;
  calculatedPrice: number;
  suggestedPrice: number;
  minimumPrice: number;
  maximumPrice: number;
  pricingRule: string;
  competitorAnalysis?: {
    averageMarketPrice: number;
    recommendation: 'BELOW_MARKET' | 'AT_MARKET' | 'ABOVE_MARKET';
  };
}

export class PricingCalculationService {

  private defaultMargin = 20; // 20% margem padrão

  /**
   * RF0052 - Calcular preço de venda automaticamente
   */
  public async calculateSalePrice(
    costPrice: number,
    pricingTypeId?: string,
    productCategories?: string[],
    productId?: string
  ): Promise<PriceCalculation> {

    if (costPrice <= 0) {
      throw new ApplicationError('Preço de custo deve ser maior que zero');
    }

    try {
      // 1. Buscar regra de precificação
      const pricingRule = await this.getPricingRule(pricingTypeId, productCategories);
      
      // 2. Calcular preço baseado na margem
      const marginPercentage = pricingRule.marginPercentage;
      const calculatedPrice = costPrice * (1 + marginPercentage / 100);
      
      // 3. Aplicar limites mínimos e máximos
      const minimumPrice = costPrice * (1 + pricingRule.minimumMargin / 100);
      const maximumPrice = costPrice * (1 + pricingRule.maximumMargin / 100);
      
      let suggestedPrice = calculatedPrice;
      
      // Ajustar se está fora dos limites
      if (suggestedPrice < minimumPrice) {
        suggestedPrice = minimumPrice;
      } else if (suggestedPrice > maximumPrice) {
        suggestedPrice = maximumPrice;
      }

      // 4. Análise competitiva (se disponível)
      const competitorAnalysis = await this.analyzeCompetitorPricing(suggestedPrice, productId);

      // 5. Ajustar preço baseado na análise competitiva
      if (competitorAnalysis) {
        suggestedPrice = this.adjustPriceBasedOnMarket(suggestedPrice, competitorAnalysis);
      }

      const calculation: PriceCalculation = {
        costPrice,
        marginPercentage,
        calculatedPrice,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100, // Arredondar para 2 casas decimais
        minimumPrice,
        maximumPrice,
        pricingRule: pricingRule.name,
        competitorAnalysis
      };

      console.log(`[PRICING] Cálculo realizado - Custo: R$${costPrice}, Margem: ${marginPercentage}%, Preço sugerido: R$${calculation.suggestedPrice}`);

      return calculation;

    } catch (error) {
      console.error('[PRICING] Erro no cálculo de preço:', error);
      throw error;
    }
  }

  /**
   * Buscar regra de precificação aplicável
   */
  private async getPricingRule(pricingTypeId?: string, productCategories?: string[]): Promise<PricingRule> {
    try {
      let pricingRule: PricingRule | null = null;

      // 1. Tentar buscar por ID específico
      if (pricingTypeId) {
        const rule = await strapi.entityService.findOne('api::precification-type.precification-type', pricingTypeId);
        const ruleData = rule as any;
        if (rule && ruleData.active) {
          pricingRule = {
            id: rule.id.toString(),
            name: rule.name || '',
            marginPercentage: ruleData.marginPercentage || this.defaultMargin,
            minimumMargin: ruleData.minimumMargin || (ruleData.marginPercentage - 5) || 15,
            maximumMargin: ruleData.maximumMargin || (ruleData.marginPercentage + 10) || 30,
            isActive: ruleData.active,
            priority: ruleData.priority || 1
          };
        }
      }

      // 2. Se não encontrou, buscar por categoria
      if (!pricingRule && productCategories && productCategories.length > 0) {
        const categoryRules = await strapi.entityService.findMany('api::precification-type.precification-type', {
          filters: {
            category: { $in: productCategories }
          } as any,
          sort: ['createdAt:desc'] as any
        });

        if (categoryRules.length > 0) {
          const rule = categoryRules[0];
          const ruleData = rule as any;
          pricingRule = {
            id: rule.id.toString(),
            name: rule.name || '',
            marginPercentage: ruleData.marginPercentage || this.defaultMargin,
            minimumMargin: ruleData.minimumMargin || (ruleData.marginPercentage - 5) || 15,
            maximumMargin: ruleData.maximumMargin || (ruleData.marginPercentage + 10) || 30,
            isActive: ruleData.active,
            category: ruleData.category,
            priority: ruleData.priority || 1
          };
        }
      }

      // 3. Usar regra padrão se não encontrou nenhuma específica
      if (!pricingRule) {
        pricingRule = {
          id: 'default',
          name: 'Margem Padrão',
          marginPercentage: this.defaultMargin,
          minimumMargin: 15,
          maximumMargin: 35,
          isActive: true,
          priority: 0
        };
      }

      return pricingRule;

    } catch (error) {
      console.error('[PRICING] Erro ao buscar regra de precificação:', error);
      
      // Retornar regra padrão em caso de erro
      return {
        id: 'default-error',
        name: 'Margem Padrão (Erro)',
        marginPercentage: this.defaultMargin,
        minimumMargin: 15,
        maximumMargin: 35,
        isActive: true,
        priority: 0
      };
    }
  }

  /**
   * Analisar preços da concorrência (mockado por enquanto)
   */
  private async analyzeCompetitorPricing(suggestedPrice: number, productId?: string) {
    try {
      // Por enquanto, simulação de análise competitiva
      // Em implementação real, integraria com APIs de comparação de preços
      
      if (!productId) return null;

      // Simular busca de produto similar no mercado
      const mockMarketPrice = suggestedPrice * (0.9 + Math.random() * 0.2); // ±10% de variação

      const competitorAnalysis = {
        averageMarketPrice: Math.round(mockMarketPrice * 100) / 100,
        recommendation: this.getMarketRecommendation(suggestedPrice, mockMarketPrice)
      };

      console.log(`[PRICING] Análise competitiva - Sugerido: R$${suggestedPrice}, Mercado: R$${competitorAnalysis.averageMarketPrice}`);

      return competitorAnalysis;

    } catch (error) {
      console.error('[PRICING] Erro na análise competitiva:', error);
      return null;
    }
  }

  /**
   * Determinar recomendação baseada no mercado
   */
  private getMarketRecommendation(suggestedPrice: number, marketPrice: number): 'BELOW_MARKET' | 'AT_MARKET' | 'ABOVE_MARKET' {
    const difference = (suggestedPrice - marketPrice) / marketPrice;
    
    if (difference < -0.05) return 'BELOW_MARKET';  // 5% abaixo
    if (difference > 0.05) return 'ABOVE_MARKET';   // 5% acima
    return 'AT_MARKET';
  }

  /**
   * Ajustar preço baseado na análise de mercado
   */
  private adjustPriceBasedOnMarket(suggestedPrice: number, competitorAnalysis: any): number {
    const { averageMarketPrice, recommendation } = competitorAnalysis;
    
    switch (recommendation) {
      case 'ABOVE_MARKET':
        // Se está muito acima do mercado, reduzir um pouco
        return Math.min(suggestedPrice, averageMarketPrice * 1.03); // Máximo 3% acima
      
      case 'BELOW_MARKET':
        // Se está abaixo do mercado, pode aumentar
        return Math.max(suggestedPrice, averageMarketPrice * 0.98); // Mínimo 2% abaixo
      
      default:
        return suggestedPrice;
    }
  }

  /**
   * Calcular múltiplas opções de preço
   */
  public async calculatePricingOptions(
    costPrice: number,
    pricingTypeId?: string,
    productCategories?: string[]
  ): Promise<{
    conservative: PriceCalculation;
    standard: PriceCalculation;
    aggressive: PriceCalculation;
  }> {

    const basePricing = await this.calculateSalePrice(costPrice, pricingTypeId, productCategories);
    
    // Opção conservadora (margem menor)
    const conservativeMargin = Math.max(basePricing.marginPercentage - 5, 10);
    const conservativePrice = costPrice * (1 + conservativeMargin / 100);
    
    // Opção agressiva (margem maior)
    const aggressiveMargin = basePricing.marginPercentage + 8;
    const aggressivePrice = costPrice * (1 + aggressiveMargin / 100);

    return {
      conservative: {
        ...basePricing,
        marginPercentage: conservativeMargin,
        calculatedPrice: conservativePrice,
        suggestedPrice: conservativePrice,
        pricingRule: 'Conservadora - ' + basePricing.pricingRule
      },
      standard: basePricing,
      aggressive: {
        ...basePricing,
        marginPercentage: aggressiveMargin,
        calculatedPrice: aggressivePrice,
        suggestedPrice: aggressivePrice,
        pricingRule: 'Agressiva - ' + basePricing.pricingRule
      }
    };
  }

  /**
   * Calcular impacto de mudança de preço
   */
  public async calculatePriceImpact(
    productId: string,
    currentPrice: number,
    newPrice: number
  ): Promise<{
    priceChange: number;
    priceChangePercentage: number;
    estimatedDemandImpact: number;
    estimatedRevenueImpact: number;
    recommendation: string;
  }> {

    const priceChange = newPrice - currentPrice;
    const priceChangePercentage = (priceChange / currentPrice) * 100;

    // Elasticidade de demanda simplificada (assumindo produto normal)
    const elasticity = -1.5; // Para cada 1% de aumento no preço, demanda cai 1.5%
    const estimatedDemandImpact = elasticity * priceChangePercentage;

    // Impacto na receita (simplificado)
    const estimatedRevenueImpact = priceChangePercentage + estimatedDemandImpact;

    let recommendation = '';
    if (estimatedRevenueImpact > 2) {
      recommendation = 'Aumento recomendado - impacto positivo na receita';
    } else if (estimatedRevenueImpact < -2) {
      recommendation = 'Cuidado - pode reduzir receita significativamente';
    } else {
      recommendation = 'Mudança neutra - impacto mínimo na receita';
    }

    return {
      priceChange,
      priceChangePercentage,
      estimatedDemandImpact,
      estimatedRevenueImpact,
      recommendation
    };
  }

  /**
   * Buscar histórico de preços de um produto
   */
  public async getPricingHistory(productId: string, limit: number = 10) {
    try {
      const history = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'product',
          entityId: productId,
          changedFields: { $contains: ['priceSell'] }
        },
        sort: ['createdAt:desc'],
        limit
      });

      const pricingHistory = history.map(entry => ({
        date: entry.timestamp,
        oldPrice: (entry.oldData as any)?.priceSell || 0,
        newPrice: (entry.newData as any)?.priceSell || 0,
        changedBy: entry.userEmail,
        reason: 'Atualização de preço'
      }));

      return {
        success: true,
        data: pricingHistory,
        total: pricingHistory.length
      };

    } catch (error) {
      console.error('[PRICING] Erro ao buscar histórico de preços:', error);
      return { success: false, data: [], total: 0 };
    }
  }

  /**
   * Sincronizar preços com base nas regras atuais
   */
  public async syncProductPrices(categoryId?: string, pricingTypeId?: string) {
    console.log('[PRICING] Iniciando sincronização de preços...');

    let processed = 0;
    let updated = 0;
    let errors = 0;

    try {
      const filters: any = { active: true };
      
      if (categoryId) {
        filters.productCategories = categoryId;
      }
      if (pricingTypeId) {
        filters.precificationType = pricingTypeId;
      }

      const products = await strapi.entityService.findMany('api::product.product', {
        filters,
        populate: {
          productCategories: { fields: ['name'] },
          precificationType: true
        } as any
      });

      for (const product of products) {
        processed++;

        try {
          if (!product.priceBuy || product.priceBuy <= 0) {
            console.log(`[PRICING] Produto ${product.title} sem preço de custo válido`);
            continue;
          }

          const categoryIds = (product as any).productCategories?.map((cat: any) => cat.id) || [];
          const calculation = await this.calculateSalePrice(
            product.priceBuy,
            (product as any).precificationType?.id,
            categoryIds,
            product.id.toString()
          );

          // Verificar se preço precisa ser atualizado
          const currentPrice = product.priceSell || 0;
          const priceDifference = Math.abs(calculation.suggestedPrice - currentPrice);
          
          if (priceDifference > 0.01) { // Atualizar se diferença > R$ 0,01
            await strapi.entityService.update('api::product.product', product.id, {
              data: {
                priceSell: calculation.suggestedPrice,
                lastPriceUpdate: new Date(),
                pricingMethod: 'AUTO_SYNC'
              }
            });

            updated++;
            console.log(`[PRICING] Produto atualizado - ${product.title}: R$${currentPrice} → R$${calculation.suggestedPrice}`);
          }

        } catch (productError) {
          errors++;
          console.error(`[PRICING] Erro ao processar produto ${product.title}:`, productError);
        }
      }

      console.log(`[PRICING] Sincronização concluída - Processados: ${processed}, Atualizados: ${updated}, Erros: ${errors}`);

      return {
        success: true,
        processed,
        updated,
        errors,
        message: `Sincronização concluída: ${updated} produtos atualizados`
      };

    } catch (error) {
      console.error('[PRICING] Erro na sincronização de preços:', error);
      return {
        success: false,
        processed,
        updated,
        errors,
        message: 'Erro na sincronização: ' + error.message
      };
    }
  }
}