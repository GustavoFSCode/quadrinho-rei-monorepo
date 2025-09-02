/**
 * Service para gerenciar transições de status de compra
 * Implementa RN0037-RN0040 com validações de transição
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
import { StockService } from './stockService';

export class PurchaseStatusService {
  
  // Define transições válidas de status
  private validTransitions = {
    'EM_PROCESSAMENTO': ['APROVADA', 'REPROVADA', 'CANCELADA'],
    'APROVADA': ['EM_TRANSITO', 'CANCELADA'],
    'REPROVADA': ['EM_PROCESSAMENTO', 'CANCELADA'],
    'EM_TRANSITO': ['ENTREGUE', 'CANCELADA'],
    'ENTREGUE': [], // Status final
    'CANCELADA': [] // Status final
  };

  /**
   * Valida se a transição de status é permitida
   */
  public validateStatusTransition(currentStatus: string, newStatus: string): boolean {
    if (!currentStatus || !newStatus) {
      return false;
    }
    
    const allowedTransitions = this.validTransitions[currentStatus];
    return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
  }

  /**
   * Atualiza status da compra com validação
   */
  public async updatePurchaseStatus(purchaseId: string, newStatus: string, userId?: number) {
    try {
      // Buscar compra atual
      const currentPurchase = await strapi.entityService.findOne('api::purchase.purchase', purchaseId);
      
      if (!currentPurchase) {
        throw new ApplicationError('Compra não encontrada');
      }

      const currentStatus = currentPurchase.purchaseStatus;
      
      // Validar transição
      if (!this.validateStatusTransition(currentStatus, newStatus)) {
        throw new ApplicationError(
          `Transição de status inválida: ${currentStatus} -> ${newStatus}`
        );
      }

      // Executar ações específicas por status
      await this.executeStatusActions(currentPurchase, newStatus);

      // Atualizar status
      const updatedPurchase = await strapi.entityService.update('api::purchase.purchase', purchaseId, {
        data: {
          purchaseStatus: newStatus as any,
          updatedAt: new Date()
        }
      });

      console.log(`[STATUS] Purchase ${purchaseId}: ${currentStatus} -> ${newStatus} by user ${userId || 'system'}`);
      
      return updatedPurchase;
    } catch (error) {
      console.error('Erro ao atualizar status da compra:', error);
      throw error;
    }
  }

  /**
   * Executa ações específicas baseadas no novo status
   */
  private async executeStatusActions(purchase: any, newStatus: string) {
    switch (newStatus) {
      case 'APROVADA':
        await this.onPurchaseApproved(purchase);
        break;
      case 'REPROVADA':
        await this.onPurchaseRejected(purchase);
        break;
      case 'EM_TRANSITO':
        await this.onPurchaseShipped(purchase);
        break;
      case 'ENTREGUE':
        await this.onPurchaseDelivered(purchase);
        break;
      case 'CANCELADA':
        await this.onPurchaseCancelled(purchase);
        break;
    }
  }

  /**
   * Ações quando compra é aprovada
   */
  private async onPurchaseApproved(purchase: any) {
    try {
      const stockService = new StockService();
      const resultado = await stockService.baixarEstoquePorCompra(purchase.id);
      console.log(`[ACTION] Compra aprovada - ID: ${purchase.id}, Estoque baixado:`, resultado.operacoes);
    } catch (error) {
      console.error(`[ERROR] Erro ao baixar estoque da compra ${purchase.id}:`, error);
      throw new ApplicationError('Erro ao processar baixa de estoque: ' + error.message);
    }
  }

  /**
   * Ações quando compra é reprovada
   */
  private async onPurchaseRejected(purchase: any) {
    // Liberar produtos do carrinho
    console.log(`[ACTION] Compra reprovada - ID: ${purchase.id}`);
  }

  /**
   * Ações quando compra é enviada
   */
  private async onPurchaseShipped(purchase: any) {
    // Enviar notificação de envio
    console.log(`[ACTION] Compra despachada - ID: ${purchase.id}`);
  }

  /**
   * Ações quando compra é entregue
   */
  private async onPurchaseDelivered(purchase: any) {
    // Finalizar processo de entrega
    console.log(`[ACTION] Compra entregue - ID: ${purchase.id}`);
  }

  /**
   * Ações quando compra é cancelada
   */
  private async onPurchaseCancelled(purchase: any) {
    // Reverter baixa de estoque se necessário
    console.log(`[ACTION] Compra cancelada - ID: ${purchase.id}`);
  }

  /**
   * Retorna status disponíveis para transição
   */
  public getAvailableTransitions(currentStatus: string): string[] {
    return this.validTransitions[currentStatus] || [];
  }
}