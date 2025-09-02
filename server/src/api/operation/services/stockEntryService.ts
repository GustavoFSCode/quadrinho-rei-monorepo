/**
 * Service de Entrada de Estoque - RF0051
 * Sistema completo para gerenciar entradas de estoque com fornecedores
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface StockEntry {
  productId: string;
  quantity: number;
  unitCost: number;
  supplierId?: string;
  supplierName?: string;
  invoiceNumber?: string;
  entryDate: Date;
  notes?: string;
  batchCode?: string;
  expirationDate?: Date;
}

export class StockEntryService {

  /**
   * RF0051 - Registrar entrada em estoque com dados completos
   */
  public async registerStockEntry(entries: StockEntry[], userId?: string) {
    console.log(`[STOCK_ENTRY] Iniciando registro de entrada de estoque - ${entries.length} itens`);

    const results = [];
    let totalValue = 0;

    try {
      // Processar cada entrada individualmente
      for (const entry of entries) {
        const result = await this.processStockEntry(entry);
        results.push(result);
        totalValue += result.totalCost;
      }

      // Criar documento de entrada de estoque
      const stockEntryDoc = await this.createStockEntryDocument({
        entries,
        results,
        totalValue,
        userId
      });

      console.log(`[STOCK_ENTRY] Entrada registrada com sucesso - Documento: ${stockEntryDoc.id}`);

      return {
        success: true,
        entryDocument: stockEntryDoc,
        results,
        totalValue,
        totalItems: entries.length,
        message: `Entrada de estoque registrada com sucesso - ${entries.length} itens processados`
      };

    } catch (error) {
      console.error('[STOCK_ENTRY] Erro no registro de entrada:', error);
      throw error;
    }
  }

  /**
   * Processar entrada individual de produto
   */
  private async processStockEntry(entry: StockEntry) {
    // Buscar produto
    const product = await strapi.entityService.findOne('api::product.product', entry.productId);
    
    if (!product) {
      throw new ApplicationError(`Produto não encontrado: ${entry.productId}`);
    }

    // Validar dados
    if (entry.quantity <= 0) {
      throw new ApplicationError('Quantidade deve ser maior que zero');
    }

    if (entry.unitCost < 0) {
      throw new ApplicationError('Custo unitário não pode ser negativo');
    }

    const previousStock = product.stock;
    const newStock = previousStock + entry.quantity;
    const totalCost = entry.quantity * entry.unitCost;

    // Atualizar produto
    const updateData: any = {
      stock: newStock,
      lastStockEntry: entry.entryDate || new Date()
    };

    // Atualizar preço de compra se fornecido
    if (entry.unitCost > 0) {
      updateData.priceBuy = entry.unitCost;
      
      // Calcular novo preço de venda se há margem configurada
      if ((product as any).pricingMargin && (product as any).pricingMargin > 0) {
        updateData.priceSell = entry.unitCost * (1 + (product as any).pricingMargin / 100);
      }
    }

    await strapi.entityService.update('api::product.product', entry.productId, {
      data: updateData
    });

    // Registrar na auditoria através do StockService
    const { StockService } = await import('./stockService');
    const stockService = new StockService();
    
    await stockService['registrarMovimentacaoEstoque']({
      tipo: 'ENTRADA_ESTOQUE',
      referencia: `ENTRADA_${Date.now()}_${entry.productId}`,
      operacoes: [{
        produtoId: entry.productId,
        produtoTitulo: product.title,
        estoqueAnterior: previousStock,
        quantidadeEntrada: entry.quantity,
        novoEstoque: newStock,
        custoUnitario: entry.unitCost,
        custoTotal: totalCost,
        fornecedor: entry.supplierName,
        numeroNota: entry.invoiceNumber,
        lote: entry.batchCode,
        operacao: 'ENTRADA_ESTOQUE'
      }],
      usuario: null // será preenchido com userId se fornecido
    });

    console.log(`[STOCK_ENTRY] Produto processado - ${product.title}: ${previousStock} → ${newStock} (+${entry.quantity})`);

    return {
      productId: entry.productId,
      productTitle: product.title,
      previousStock,
      newStock,
      quantityAdded: entry.quantity,
      unitCost: entry.unitCost,
      totalCost,
      success: true
    };
  }

  /**
   * Criar documento de entrada de estoque para auditoria
   */
  private async createStockEntryDocument(data: any) {
    const entryDoc = await strapi.entityService.create('api::audit-log.audit-log', {
      data: {
        operation: 'CREATE',
        entityName: 'stock-entry-batch',
        entityId: `batch-${Date.now()}`,
        userId: data.userId,
        userEmail: null,
        oldData: null,
        newData: {
          entryType: 'STOCK_ENTRY',
          totalItems: data.totalItems,
          totalValue: data.totalValue,
          entries: data.entries,
          results: data.results,
          entryDate: new Date().toISOString(),
          status: 'COMPLETED'
        } as any,
        changedFields: ['product.stock', 'product.priceBuy'],
        timestamp: new Date(),
        ipAddress: 'system',
        userAgent: 'stock-entry-service'
      }
    });

    return entryDoc;
  }

  /**
   * Buscar histórico de entradas de estoque
   */
  public async getStockEntryHistory(filters?: {
    productId?: string,
    startDate?: Date,
    endDate?: Date,
    supplierId?: string,
    page?: number,
    pageSize?: number
  }) {
    const { page = 1, pageSize = 20 } = filters || {};
    const start = (page - 1) * pageSize;

    const queryFilters: any = {
      entityName: 'stock-entry-batch'
    };

    if (filters?.startDate || filters?.endDate) {
      queryFilters.timestamp = {};
      if (filters.startDate) {
        queryFilters.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        queryFilters.timestamp.$lte = filters.endDate;
      }
    }

    const entries = await strapi.entityService.findMany('api::audit-log.audit-log', {
      filters: queryFilters,
      sort: ['timestamp:desc'],
      start,
      limit: pageSize
    });

    const totalCount = await strapi.entityService.count('api::audit-log.audit-log', {
      filters: queryFilters
    });

    return {
      data: entries.map(entry => ({
        id: entry.id,
        entryDate: entry.timestamp,
        totalItems: (entry.newData as any)?.totalItems || 0,
        totalValue: (entry.newData as any)?.totalValue || 0,
        entries: (entry.newData as any)?.entries || [],
        results: (entry.newData as any)?.results || []
      })),
      pagination: {
        page,
        pageSize,
        total: totalCount,
        pageCount: Math.ceil(totalCount / pageSize)
      }
    };
  }

  /**
   * Obter estatísticas de entrada de estoque
   */
  public async getStockEntryStats(period?: { startDate: Date, endDate: Date }) {
    const filters: any = {
      entityName: 'stock-entry-batch'
    };

    if (period) {
      filters.timestamp = {
        $gte: period.startDate,
        $lte: period.endDate
      };
    }

    const entries = await strapi.entityService.findMany('api::audit-log.audit-log', {
      filters
    });

    const stats = entries.reduce((acc, entry) => {
      const data = entry.newData as any;
      if (data) {
        acc.totalEntries += 1;
        acc.totalItems += data.totalItems || 0;
        acc.totalValue += data.totalValue || 0;
        
        // Agrupar por produto
        if (data.results) {
          data.results.forEach((result: any) => {
            const productId = result.productId;
            if (!acc.productStats[productId]) {
              acc.productStats[productId] = {
                productTitle: result.productTitle,
                totalQuantity: 0,
                totalValue: 0,
                entryCount: 0
              };
            }
            acc.productStats[productId].totalQuantity += result.quantityAdded;
            acc.productStats[productId].totalValue += result.totalCost;
            acc.productStats[productId].entryCount += 1;
          });
        }
      }
      return acc;
    }, {
      totalEntries: 0,
      totalItems: 0,
      totalValue: 0,
      productStats: {} as Record<string, any>
    });

    return stats;
  }

  /**
   * Entrada rápida para um produto
   */
  public async quickStockEntry(productId: string, quantity: number, unitCost: number, supplierName?: string, notes?: string) {
    const entry: StockEntry = {
      productId,
      quantity,
      unitCost,
      supplierName,
      notes,
      entryDate: new Date()
    };

    return this.registerStockEntry([entry]);
  }

  /**
   * Importar entrada de estoque via CSV/dados externos
   */
  public async importStockEntries(entriesData: any[], userId?: string) {
    console.log(`[STOCK_ENTRY] Importando ${entriesData.length} entradas de estoque`);

    const validEntries: StockEntry[] = [];
    const errors: string[] = [];

    // Validar e processar dados
    for (let i = 0; i < entriesData.length; i++) {
      try {
        const data = entriesData[i];
        
        // Validação básica
        if (!data.productId) {
          errors.push(`Linha ${i + 1}: ID do produto é obrigatório`);
          continue;
        }

        if (!data.quantity || data.quantity <= 0) {
          errors.push(`Linha ${i + 1}: Quantidade deve ser maior que zero`);
          continue;
        }

        if (data.unitCost === undefined || data.unitCost < 0) {
          errors.push(`Linha ${i + 1}: Custo unitário é obrigatório e não pode ser negativo`);
          continue;
        }

        const entry: StockEntry = {
          productId: data.productId,
          quantity: Number(data.quantity),
          unitCost: Number(data.unitCost),
          supplierName: data.supplierName,
          invoiceNumber: data.invoiceNumber,
          entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
          notes: data.notes,
          batchCode: data.batchCode
        };

        validEntries.push(entry);
      } catch (error) {
        errors.push(`Linha ${i + 1}: ${error.message}`);
      }
    }

    if (errors.length > 0 && validEntries.length === 0) {
      throw new ApplicationError('Nenhuma entrada válida encontrada: ' + errors.join('; '));
    }

    // Processar entradas válidas
    const result = await this.registerStockEntry(validEntries, userId);

    return {
      ...result,
      importStats: {
        totalLines: entriesData.length,
        validEntries: validEntries.length,
        errors: errors.length,
        errorMessages: errors
      }
    };
  }
}