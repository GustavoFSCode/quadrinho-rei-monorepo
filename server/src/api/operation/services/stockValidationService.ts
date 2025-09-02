/**
 * Service de Validação de Estoque - RN0028
 * Implementa validações críticas antes de operações de estoque
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface StockValidationResult {
  isValid: boolean;
  message: string;
  currentStatus?: string;
  allowedStatuses?: string[];
}

export interface StockOperation {
  type: 'BAIXA' | 'ENTRADA' | 'REENTRADA';
  purchaseId?: string;
  productId: string;
  quantity: number;
  reason: string;
}

export class StockValidationService {

  /**
   * RN0028 - Validar se compra tem status adequado para baixa de estoque
   */
  public async validateStockOperationByPurchaseStatus(
    purchaseId: string,
    operation: 'BAIXA' | 'ENTRADA' | 'REENTRADA'
  ): Promise<StockValidationResult> {

    console.log(`[STOCK_VALIDATION] Validando operação ${operation} para compra ${purchaseId}`);

    try {
      // Buscar compra com status atual
      const purchase = await strapi.entityService.findOne('api::purchase.purchase', purchaseId, {
        populate: {
          purchaseSalesStatus: {
            fields: ['name']
          }
        }
      });

      if (!purchase) {
        return {
          isValid: false,
          message: 'Compra não encontrada'
        };
      }

      const currentStatus = (purchase as any).purchaseSalesStatus?.name || 'EM_PROCESSAMENTO';

      // Definir status permitidos para cada operação
      const allowedStatusesByOperation = {
        'BAIXA': ['APROVADA'], // RN0028: Apenas compras aprovadas podem ter estoque baixado
        'ENTRADA': ['*'], // Entrada de estoque não depende de status de compra
        'REENTRADA': ['TROCADO', 'CANCELADA'] // Reentrada por troca ou cancelamento
      };

      const allowedStatuses = allowedStatusesByOperation[operation];
      const isValid = allowedStatuses.includes('*') || allowedStatuses.includes(currentStatus);

      if (!isValid) {
        return {
          isValid: false,
          message: `Operação ${operation} não permitida. Status atual: ${currentStatus}. Status necessários: ${allowedStatuses.join(', ')}`,
          currentStatus,
          allowedStatuses
        };
      }

      console.log(`[STOCK_VALIDATION] ✅ Operação ${operation} autorizada - Status: ${currentStatus}`);

      return {
        isValid: true,
        message: `Operação ${operation} autorizada`,
        currentStatus,
        allowedStatuses
      };

    } catch (error) {
      console.error('[STOCK_VALIDATION] Erro na validação:', error);
      return {
        isValid: false,
        message: 'Erro interno na validação: ' + error.message
      };
    }
  }

  /**
   * Validar se produto tem estoque suficiente para operação
   */
  public async validateProductStock(
    productId: string, 
    requestedQuantity: number, 
    operation: 'RESERVA' | 'BAIXA'
  ): Promise<StockValidationResult> {

    try {
      const product = await strapi.entityService.findOne('api::product.product', productId);

      if (!product) {
        return {
          isValid: false,
          message: 'Produto não encontrado'
        };
      }

      const currentStock = product.stock || 0;

      if (operation === 'BAIXA' && currentStock < requestedQuantity) {
        return {
          isValid: false,
          message: `Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${requestedQuantity}`
        };
      }

      if (operation === 'RESERVA' && currentStock < requestedQuantity) {
        return {
          isValid: false,
          message: `Não há estoque suficiente para reserva. Disponível: ${currentStock}, Solicitado: ${requestedQuantity}`
        };
      }

      return {
        isValid: true,
        message: `Estoque suficiente - Disponível: ${currentStock}`
      };

    } catch (error) {
      console.error('[STOCK_VALIDATION] Erro na validação de estoque:', error);
      return {
        isValid: false,
        message: 'Erro interno na validação de estoque: ' + error.message
      };
    }
  }

  /**
   * Validar operação de estoque completa com auditoria
   */
  public async validateStockOperation(stockOperation: StockOperation): Promise<StockValidationResult> {
    console.log(`[STOCK_VALIDATION] Iniciando validação completa para operação:`, stockOperation);

    try {
      // 1. Validar status da compra (se aplicável)
      if (stockOperation.purchaseId && stockOperation.type === 'BAIXA') {
        const statusValidation = await this.validateStockOperationByPurchaseStatus(
          stockOperation.purchaseId, 
          stockOperation.type
        );

        if (!statusValidation.isValid) {
          return statusValidation;
        }
      }

      // 2. Validar estoque do produto
      if (stockOperation.type === 'BAIXA') {
        const stockValidation = await this.validateProductStock(
          stockOperation.productId,
          stockOperation.quantity,
          'BAIXA'
        );

        if (!stockValidation.isValid) {
          return stockValidation;
        }
      }

      // 3. Registrar tentativa de validação para auditoria
      await this.logStockValidation(stockOperation, true);

      return {
        isValid: true,
        message: `Operação ${stockOperation.type} validada com sucesso`
      };

    } catch (error) {
      // Registrar falha para auditoria
      await this.logStockValidation(stockOperation, false, error.message);
      
      console.error('[STOCK_VALIDATION] Erro na validação completa:', error);
      return {
        isValid: false,
        message: 'Erro interno na validação: ' + error.message
      };
    }
  }

  /**
   * Registrar validação de estoque para auditoria
   */
  private async logStockValidation(
    operation: StockOperation, 
    success: boolean, 
    errorMessage?: string
  ): Promise<void> {
    try {
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'UPDATE',
          entityName: 'stock-validation',
          entityId: `${operation.type}_${operation.productId}_${Date.now()}`,
          userId: null,
          userEmail: 'system-stock-validation',
          oldData: null,
          newData: {
            validationType: 'STOCK_OPERATION_VALIDATION',
            operationType: operation.type,
            productId: operation.productId,
            purchaseId: operation.purchaseId,
            quantity: operation.quantity,
            reason: operation.reason,
            success,
            errorMessage,
            validatedAt: new Date().toISOString()
          } as any,
          changedFields: ['stock.validation'],
          timestamp: new Date(),
          ipAddress: 'system',
          userAgent: 'stock-validation-service'
        }
      });
    } catch (auditError) {
      console.error('[STOCK_VALIDATION] Erro ao registrar auditoria:', auditError);
    }
  }

  /**
   * Obter histórico de validações de um produto
   */
  public async getProductValidationHistory(productId: string, limit: number = 10) {
    try {
      const validations = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'stock-validation'
        },
        sort: ['timestamp:desc'],
        limit
      });

      const productValidations = validations.filter((log: any) => {
        const data = log.newData as any;
        return data?.validationType === 'STOCK_OPERATION_VALIDATION' && 
               data?.productId === productId;
      });

      return {
        success: true,
        data: productValidations.map((log: any) => ({
          timestamp: log.timestamp,
          operation: log.newData?.operationType,
          success: log.newData?.success,
          quantity: log.newData?.quantity,
          reason: log.newData?.reason,
          errorMessage: log.newData?.errorMessage
        })),
        total: productValidations.length
      };

    } catch (error) {
      console.error('[STOCK_VALIDATION] Erro ao buscar histórico:', error);
      return { success: false, data: [], total: 0 };
    }
  }

  /**
   * Obter estatísticas de validações de estoque
   */
  public async getValidationStats() {
    try {
      const validations = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'stock-validation'
        }
      });

      const stockValidations = validations.filter((log: any) => {
        const data = log.newData as any;
        return data?.validationType === 'STOCK_OPERATION_VALIDATION';
      });

      const stats = {
        totalValidations: stockValidations.length,
        successfulValidations: stockValidations.filter((v: any) => (v.newData as any)?.success).length,
        failedValidations: stockValidations.filter((v: any) => !(v.newData as any)?.success).length,
        operationTypeBreakdown: {} as Record<string, number>,
        successRate: 0
      };

      // Análise por tipo de operação
      stockValidations.forEach((validation: any) => {
        const operationType = (validation.newData as any)?.operationType || 'UNKNOWN';
        stats.operationTypeBreakdown[operationType] = (stats.operationTypeBreakdown[operationType] || 0) + 1;
      });

      // Taxa de sucesso
      stats.successRate = stats.totalValidations > 0 
        ? Math.round((stats.successfulValidations / stats.totalValidations) * 100)
        : 0;

      return stats;

    } catch (error) {
      console.error('[STOCK_VALIDATION] Erro ao gerar estatísticas:', error);
      return null;
    }
  }
}