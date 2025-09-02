/**
 * Service de Notificações de Estoque - RN0031-RN0032
 * Implementa validações automáticas de estoque no carrinho com notificações
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
import { NotificationService } from './notificationService';
import { StockValidationService } from './stockValidationService';

export interface StockNotificationConfig {
  enabled: boolean;
  thresholds: {
    low: number;      // Estoque baixo (ex: < 5 unidades)
    critical: number; // Estoque crítico (ex: < 2 unidades)
    outOfStock: number; // Sem estoque (0 unidades)
  };
  notifyUsers: boolean;
  notifyAdmins: boolean;
  autoRemoveFromCart: boolean;
}

export interface CartStockValidation {
  productId: string;
  productTitle: string;
  requestedQuantity: number;
  availableStock: number;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'INSUFFICIENT' | 'OUT_OF_STOCK';
  message: string;
  actions: string[];
}

export class StockNotificationService {

  private notificationService: NotificationService;
  private stockValidationService: StockValidationService;
  
  private defaultConfig: StockNotificationConfig = {
    enabled: true,
    thresholds: {
      low: 5,
      critical: 2,
      outOfStock: 0
    },
    notifyUsers: true,
    notifyAdmins: true,
    autoRemoveFromCart: false
  };

  constructor() {
    this.notificationService = new NotificationService();
    this.stockValidationService = new StockValidationService();
  }

  /**
   * RN0031 - Validar estoque ao adicionar produto no carrinho
   */
  public async validateCartProductStock(
    productId: string, 
    requestedQuantity: number, 
    clientId: string
  ): Promise<CartStockValidation> {
    
    console.log(`[STOCK_NOTIFICATION] Validando estoque para produto ${productId}, quantidade: ${requestedQuantity}`);

    try {
      // Buscar produto com estoque atual usando documentId
      const product = await strapi.documents('api::product.product').findOne({
        documentId: productId
      });

      if (!product) {
        return {
          productId,
          productTitle: 'Produto não encontrado',
          requestedQuantity,
          availableStock: 0,
          status: 'OUT_OF_STOCK',
          message: 'Produto não encontrado no sistema',
          actions: ['REMOVE_FROM_CART']
        };
      }

      const availableStock = product.stock || 0;
      const productTitle = product.title || 'Produto sem título';

      // Determinar status do estoque
      let status: CartStockValidation['status'];
      let message: string;
      let actions: string[] = [];

      if (availableStock === 0) {
        status = 'OUT_OF_STOCK';
        message = `${productTitle} está fora de estoque`;
        actions = ['REMOVE_FROM_CART', 'NOTIFY_RESTOCK'];
      } else if (requestedQuantity > availableStock) {
        status = 'INSUFFICIENT';
        message = `Estoque insuficiente. Disponível: ${availableStock}, Solicitado: ${requestedQuantity}`;
        actions = ['ADJUST_QUANTITY', 'NOTIFY_LIMITED'];
      } else if (availableStock <= this.defaultConfig.thresholds.critical) {
        status = 'LOW_STOCK';
        message = `Produto com estoque crítico (${availableStock} unidades restantes)`;
        actions = ['ALLOW_WITH_WARNING', 'NOTIFY_LOW_STOCK'];
      } else {
        status = 'AVAILABLE';
        message = 'Produto disponível';
        actions = ['ALLOW'];
      }

      const validation: CartStockValidation = {
        productId,
        productTitle,
        requestedQuantity,
        availableStock,
        status,
        message,
        actions
      };

      // Processar ações automáticas
      await this.processStockActions(validation, clientId);

      console.log(`[STOCK_NOTIFICATION] ✅ Produto validado - Status: ${status}, Ações: [${actions.join(', ')}]`);

      return validation;

    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro na validação:', error);
      throw error;
    }
  }

  /**
   * RN0032 - Validar todo o carrinho e notificar sobre mudanças
   */
  public async validateFullCart(clientId: string): Promise<{
    validations: CartStockValidation[];
    summary: {
      total: number;
      available: number;
      lowStock: number;
      insufficient: number;
      outOfStock: number;
    };
    actions: {
      removedItems: string[];
      adjustedItems: string[];
      warnings: string[];
    };
  }> {

    console.log(`[STOCK_NOTIFICATION] Validando carrinho completo para cliente ${clientId}`);

    try {
      // Buscar carrinho do cliente com produtos usando documentId
      const client = await strapi.documents('api::client.client').findOne({
        documentId: clientId,
        populate: {
          cart: {
            populate: {
              cartOrders: {
                populate: {
                  product: {}
                }
              }
            }
          }
        }
      });

      if (!client || !(client as any).cart || !(client as any).cart.cartOrders) {
        return {
          validations: [],
          summary: { total: 0, available: 0, lowStock: 0, insufficient: 0, outOfStock: 0 },
          actions: { removedItems: [], adjustedItems: [], warnings: [] }
        };
      }

      const cartOrders = (client as any).cart.cartOrders;
      const validations: CartStockValidation[] = [];
      const removedItems: string[] = [];
      const adjustedItems: string[] = [];
      const warnings: string[] = [];

      // Validar cada produto no carrinho
      for (const cartOrder of cartOrders) {
        const product = cartOrder.product;
        const quantity = cartOrder.quantity;

        if (!product) {
          removedItems.push(`Item ${cartOrder.documentId} removido - produto inválido`);
          await this.removeCartItem(cartOrder.documentId);
          continue;
        }

        const validation = await this.validateCartProductStock(
          product.documentId,
          quantity,
          clientId
        );

        validations.push(validation);

        // Processar ações baseadas no resultado
        if (validation.actions.includes('REMOVE_FROM_CART')) {
          removedItems.push(`${validation.productTitle} removido do carrinho`);
          await this.removeCartItem(cartOrder.documentId);
        } else if (validation.actions.includes('ADJUST_QUANTITY')) {
          const newQuantity = Math.min(quantity, validation.availableStock);
          adjustedItems.push(`${validation.productTitle}: quantidade ajustada para ${newQuantity}`);
          await this.adjustCartItemQuantity(cartOrder.documentId, newQuantity);
        } else if (validation.actions.includes('ALLOW_WITH_WARNING')) {
          warnings.push(`${validation.productTitle}: ${validation.message}`);
        }
      }

      // Calcular resumo
      const summary = {
        total: validations.length,
        available: validations.filter(v => v.status === 'AVAILABLE').length,
        lowStock: validations.filter(v => v.status === 'LOW_STOCK').length,
        insufficient: validations.filter(v => v.status === 'INSUFFICIENT').length,
        outOfStock: validations.filter(v => v.status === 'OUT_OF_STOCK').length
      };

      // Enviar notificação resumo ao cliente se houver mudanças
      if (removedItems.length > 0 || adjustedItems.length > 0 || warnings.length > 0) {
        await this.sendCartUpdateNotification(clientId, {
          removedItems,
          adjustedItems, 
          warnings,
          summary
        });
      }

      console.log(`[STOCK_NOTIFICATION] ✅ Carrinho validado - Total: ${summary.total}, Problemas: ${summary.insufficient + summary.outOfStock}`);

      return { validations, summary, actions: { removedItems, adjustedItems, warnings } };

    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro na validação do carrinho:', error);
      throw error;
    }
  }

  /**
   * Processar ações automáticas baseadas no resultado da validação
   */
  private async processStockActions(validation: CartStockValidation, clientId: string): Promise<void> {
    try {
      // Notificar usuário se necessário
      if (this.defaultConfig.notifyUsers && validation.status !== 'AVAILABLE') {
        await this.sendStockNotificationToUser(clientId, validation);
      }

      // Notificar administradores sobre estoque crítico
      if (this.defaultConfig.notifyAdmins && validation.status === 'LOW_STOCK') {
        await this.sendStockNotificationToAdmins(validation);
      }

      // Registrar validação para auditoria
      await this.logStockValidation(validation, clientId);

    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro ao processar ações:', error);
    }
  }

  /**
   * Enviar notificação de estoque para usuário
   */
  private async sendStockNotificationToUser(clientId: string, validation: CartStockValidation): Promise<void> {
    try {
      let templateKey = '';
      const templateData = {
        productTitle: validation.productTitle,
        requestedQuantity: validation.requestedQuantity,
        availableStock: validation.availableStock,
        message: validation.message
      };

      switch (validation.status) {
        case 'OUT_OF_STOCK':
          templateKey = 'stock_out_of_stock';
          break;
        case 'INSUFFICIENT':
          templateKey = 'stock_insufficient';
          break;
        case 'LOW_STOCK':
          templateKey = 'stock_low_warning';
          break;
        default:
          return; // Não notificar para produtos disponíveis
      }

      await this.notificationService.sendNotification(
        templateKey,
        'client',
        clientId,
        templateData,
        {
          priority: validation.status === 'OUT_OF_STOCK' ? 'high' : 'medium',
          forceChannels: ['inApp']
        }
      );

      console.log(`[STOCK_NOTIFICATION] Notificação enviada ao cliente ${clientId} - Template: ${templateKey}`);

    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro ao notificar usuário:', error);
    }
  }

  /**
   * Enviar notificação para administradores sobre estoque crítico
   */
  private async sendStockNotificationToAdmins(validation: CartStockValidation): Promise<void> {
    try {
      await this.notificationService.sendNotification(
        'admin_low_stock_alert',
        'admin',
        'all',
        {
          productTitle: validation.productTitle,
          productId: validation.productId,
          availableStock: validation.availableStock,
          threshold: this.defaultConfig.thresholds.critical
        },
        {
          priority: 'high',
          forceChannels: ['email', 'inApp']
        }
      );

      console.log(`[STOCK_NOTIFICATION] Alerta enviado aos administradores - Produto: ${validation.productTitle}`);

    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro ao notificar administradores:', error);
    }
  }

  /**
   * Enviar notificação de atualização do carrinho
   */
  private async sendCartUpdateNotification(clientId: string, updateData: any): Promise<void> {
    try {
      await this.notificationService.sendNotification(
        'cart_stock_update',
        'client',
        clientId,
        updateData,
        {
          priority: 'medium',
          forceChannels: ['inApp']
        }
      );

      console.log(`[STOCK_NOTIFICATION] Notificação de atualização de carrinho enviada ao cliente ${clientId}`);

    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro ao enviar notificação de atualização:', error);
    }
  }

  /**
   * Remover item do carrinho
   */
  private async removeCartItem(cartOrderId: string): Promise<void> {
    try {
      await strapi.documents('api::card-order.card-order').delete({
        documentId: cartOrderId
      });
      console.log(`[STOCK_NOTIFICATION] Item ${cartOrderId} removido do carrinho por falta de estoque`);
    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro ao remover item do carrinho:', error);
    }
  }

  /**
   * Ajustar quantidade de item do carrinho
   */
  private async adjustCartItemQuantity(cartOrderId: string, newQuantity: number): Promise<void> {
    try {
      await strapi.documents('api::card-order.card-order').update({
        documentId: cartOrderId,
        data: { quantity: newQuantity }
      });
      console.log(`[STOCK_NOTIFICATION] Quantidade do item ${cartOrderId} ajustada para ${newQuantity}`);
    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro ao ajustar quantidade:', error);
    }
  }

  /**
   * Registrar validação de estoque para auditoria
   */
  private async logStockValidation(validation: CartStockValidation, clientId: string): Promise<void> {
    try {
      // Só registrar se audit-log existir
      const auditLogExists = strapi.contentTypes['api::audit-log.audit-log'];
      if (auditLogExists) {
        await strapi.documents('api::audit-log.audit-log').create({
          data: {
            operation: 'UPDATE',
            entityName: 'cart-stock-validation',
            entityId: `${validation.productId}_${clientId}_${Date.now()}`,
            userId: null,
            userEmail: `client-${clientId}`,
            oldData: null,
            newData: {
              validationType: 'CART_STOCK_VALIDATION',
              clientId,
              ...validation,
              validatedAt: new Date().toISOString()
            } as any,
            changedFields: ['cart.stock.validation'],
            timestamp: new Date(),
            ipAddress: 'system',
            userAgent: 'stock-notification-service'
          }
        });
      } else {
        console.log('[STOCK_NOTIFICATION] Audit log não disponível, pulando registro');
      }
    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro ao registrar auditoria:', error);
    }
  }

  /**
   * Obter estatísticas de validações de carrinho
   */
  public async getCartValidationStats(clientId?: string, days: number = 30) {
    try {
      const filters: any = {
        entityName: 'cart-stock-validation',
        timestamp: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      };

      if (clientId) {
        filters.userEmail = `client-${clientId}`;
      }

      // Verificar se audit-log existe antes de buscar
      const auditLogExists = strapi.contentTypes['api::audit-log.audit-log'];
      if (!auditLogExists) {
        return {
          totalValidations: 0,
          byStatus: { AVAILABLE: 0, LOW_STOCK: 0, INSUFFICIENT: 0, OUT_OF_STOCK: 0 },
          commonIssues: [],
          period: `${days} dias`,
          note: 'Audit log não disponível'
        };
      }

      const validations = await strapi.documents('api::audit-log.audit-log').findMany({
        filters,
        sort: ['timestamp:desc']
      });

      const stats = {
        totalValidations: validations.length,
        byStatus: {
          AVAILABLE: 0,
          LOW_STOCK: 0,
          INSUFFICIENT: 0,
          OUT_OF_STOCK: 0
        },
        commonIssues: [] as Array<{ productTitle: string; count: number }>,
        period: `${days} dias`
      };

      const productIssues: Record<string, { productTitle: string; count: number }> = {};

      validations.forEach((validation: any) => {
        const data = validation.newData as any;
        if (data?.validationType === 'CART_STOCK_VALIDATION') {
          stats.byStatus[data.status as keyof typeof stats.byStatus]++;
          
          if (data.status !== 'AVAILABLE') {
            const key = data.productTitle || 'Produto sem título';
            if (!productIssues[key]) {
              productIssues[key] = { productTitle: key, count: 0 };
            }
            productIssues[key].count++;
          }
        }
      });

      stats.commonIssues = Object.values(productIssues)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return stats;

    } catch (error) {
      console.error('[STOCK_NOTIFICATION] Erro ao gerar estatísticas:', error);
      return null;
    }
  }

  /**
   * Configurar thresholds de estoque
   */
  public async updateStockThresholds(newThresholds: Partial<StockNotificationConfig['thresholds']>) {
    this.defaultConfig.thresholds = {
      ...this.defaultConfig.thresholds,
      ...newThresholds
    };

    console.log('[STOCK_NOTIFICATION] Thresholds atualizados:', this.defaultConfig.thresholds);
    return this.defaultConfig.thresholds;
  }
}