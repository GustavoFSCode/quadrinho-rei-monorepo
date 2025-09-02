/**
 * Service de Expiração de Carrinho - RN0044
 * Implementa bloqueio temporário de produtos no carrinho com expiração
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface CartReservation {
  cartOrderId: string;
  productId: string;
  quantity: number;
  reservedAt: Date;
  expiresAt: Date;
  clientId: string;
  isExpired: boolean;
}

export interface ExpirationConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  cleanupIntervalMinutes: number;
  maxReservationTime: number;
}

export class CartExpirationService {

  private defaultConfig: ExpirationConfig = {
    timeoutMinutes: 15,        // 15 minutos para expirar
    warningMinutes: 5,         // Avisar 5 minutos antes
    cleanupIntervalMinutes: 5, // Limpeza a cada 5 minutos
    maxReservationTime: 30     // Máximo 30 minutos
  };

  /**
   * RN0044 - Bloquear produtos no carrinho temporariamente
   */
  public async reserveProductInCart(
    cartOrderId: string,
    productId: string,
    quantity: number,
    clientId: string,
    timeoutMinutes?: number
  ): Promise<CartReservation> {

    const timeout = timeoutMinutes || this.defaultConfig.timeoutMinutes;
    const reservedAt = new Date();
    const expiresAt = new Date(reservedAt.getTime() + timeout * 60 * 1000);

    try {
      // Verificar se produto já está reservado por outro cliente
      const existingReservations = await this.getActiveReservations(productId);
      const otherClientReservations = existingReservations.filter(r => r.clientId !== clientId);
      
      const totalReservedByOthers = otherClientReservations.reduce((sum, r) => sum + r.quantity, 0);
      
      // Buscar estoque atual do produto
      const product = await strapi.entityService.findOne('api::product.product', productId);
      if (!product) {
        throw new ApplicationError('Produto não encontrado');
      }

      const availableStock = product.stock - totalReservedByOthers;
      
      if (quantity > availableStock) {
        throw new ApplicationError(
          `Quantidade não disponível. Estoque: ${product.stock}, Reservado: ${totalReservedByOthers}, Disponível: ${availableStock}`
        );
      }

      // Criar/atualizar reserva
      const reservation: CartReservation = {
        cartOrderId,
        productId,
        quantity,
        reservedAt,
        expiresAt,
        clientId,
        isExpired: false
      };

      // Salvar reserva no sistema (usando audit-log como storage temporário)
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'cart-reservation',
          entityId: cartOrderId,
          userId: null,
          userEmail: `client-${clientId}`,
          oldData: null,
          newData: {
            reservationType: 'CART_PRODUCT_BLOCK',
            cartOrderId,
            productId,
            productTitle: product.title,
            quantity,
            clientId,
            reservedAt: reservedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            status: 'ACTIVE',
            timeoutMinutes: timeout
          } as any,
          changedFields: ['cart.reserved'],
          timestamp: reservedAt,
          ipAddress: 'system',
          userAgent: 'cart-expiration-service'
        }
      });

      console.log(`[CART_EXP] Produto reservado - Cliente: ${clientId}, Produto: ${product.title}, Quantidade: ${quantity}, Expira: ${expiresAt.toISOString()}`);

      return reservation;

    } catch (error) {
      console.error('[CART_EXP] Erro ao reservar produto:', error);
      throw error;
    }
  }

  /**
   * Liberar reserva de produto no carrinho
   */
  public async releaseProductReservation(cartOrderId: string): Promise<void> {
    try {
      // Buscar reserva ativa
      const reservations = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'cart-reservation',
          entityId: cartOrderId
        }
      });

      for (const reservation of reservations) {
        const data = reservation.newData as any;
        if (data.status === 'ACTIVE') {
          // Marcar como liberada
          await strapi.entityService.update('api::audit-log.audit-log', reservation.id, {
            data: {
              newData: {
                ...data,
                status: 'RELEASED',
                releasedAt: new Date().toISOString()
              } as any
            }
          });

          console.log(`[CART_EXP] Reserva liberada - Carrinho: ${cartOrderId}, Produto: ${data.productTitle}`);
        }
      }

    } catch (error) {
      console.error('[CART_EXP] Erro ao liberar reserva:', error);
      throw error;
    }
  }

  /**
   * Buscar reservas ativas de um produto
   */
  public async getActiveReservations(productId?: string): Promise<CartReservation[]> {
    try {
      const filters: any = {
        entityName: 'cart-reservation'
      };

      const reservations = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters,
        sort: ['createdAt:desc']
      });

      const activeReservations: CartReservation[] = [];

      for (const reservation of reservations) {
        const data = reservation.newData as any;
        
        if (data.status !== 'ACTIVE') continue;
        if (productId && data.productId !== productId) continue;

        const expiresAt = new Date(data.expiresAt);
        const isExpired = new Date() > expiresAt;

        // Se expirou, marcar como expirada
        if (isExpired && data.status === 'ACTIVE') {
          await this.markAsExpired(reservation.id.toString(), data);
          continue;
        }

        activeReservations.push({
          cartOrderId: data.cartOrderId,
          productId: data.productId,
          quantity: data.quantity,
          reservedAt: new Date(data.reservedAt),
          expiresAt,
          clientId: data.clientId,
          isExpired
        });
      }

      return activeReservations;

    } catch (error) {
      console.error('[CART_EXP] Erro ao buscar reservas ativas:', error);
      return [];
    }
  }

  /**
   * Processo de limpeza automática de reservas expiradas
   */
  public async cleanupExpiredReservations(): Promise<{
    processed: number;
    expired: number;
    released: number;
  }> {
    console.log('[CART_EXP] Iniciando limpeza de reservas expiradas...');

    let processed = 0;
    let expired = 0;
    let released = 0;

    try {
      const reservations = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'cart-reservation'
        }
      });

      for (const reservation of reservations) {
        processed++;
        const data = reservation.newData as any;

        if (data.status !== 'ACTIVE') continue;

        const expiresAt = new Date(data.expiresAt);
        const isExpired = new Date() > expiresAt;

        if (isExpired) {
          await this.markAsExpired(reservation.id.toString(), data);
          
          // Liberar estoque do produto se necessário
          await this.releaseStockForExpiredReservation(data);
          
          expired++;
          released++;

          console.log(`[CART_EXP] Reserva expirada liberada - Produto: ${data.productTitle}, Cliente: ${data.clientId}`);
        }
      }

      console.log(`[CART_EXP] Limpeza concluída - Processadas: ${processed}, Expiradas: ${expired}, Liberadas: ${released}`);

      return { processed, expired, released };

    } catch (error) {
      console.error('[CART_EXP] Erro na limpeza de reservas:', error);
      return { processed, expired, released };
    }
  }

  /**
   * Verificar se cliente tem reservas próximas ao vencimento
   */
  public async getClientExpiringReservations(clientId: string, warningMinutes?: number): Promise<{
    expiringSoon: CartReservation[];
    totalReservations: number;
    nextExpiration?: Date;
  }> {
    const warningTime = warningMinutes || this.defaultConfig.warningMinutes;
    const warningThreshold = new Date(Date.now() + warningTime * 60 * 1000);

    try {
      const activeReservations = await this.getActiveReservations();
      const clientReservations = activeReservations.filter(r => r.clientId === clientId);
      
      const expiringSoon = clientReservations.filter(r => 
        r.expiresAt <= warningThreshold && !r.isExpired
      );

      const nextExpiration = clientReservations.length > 0 
        ? clientReservations.reduce((earliest, current) => 
            current.expiresAt < earliest ? current.expiresAt : earliest, 
            clientReservations[0].expiresAt
          )
        : undefined;

      return {
        expiringSoon,
        totalReservations: clientReservations.length,
        nextExpiration
      };

    } catch (error) {
      console.error('[CART_EXP] Erro ao verificar reservas do cliente:', error);
      return { expiringSoon: [], totalReservations: 0 };
    }
  }

  /**
   * Estender tempo de reserva (se permitido)
   */
  public async extendReservation(
    cartOrderId: string, 
    additionalMinutes: number,
    clientId: string
  ): Promise<{ success: boolean; newExpiresAt?: Date; message: string }> {

    try {
      const reservations = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'cart-reservation',
          entityId: cartOrderId
        }
      });

      const activeReservation = reservations.find(r => (r.newData as any).status === 'ACTIVE');
      if (!activeReservation) {
        return { success: false, message: 'Reserva não encontrada ou já expirou' };
      }

      const data = activeReservation.newData as any;
      if (data.clientId !== clientId) {
        return { success: false, message: 'Reserva pertence a outro cliente' };
      }

      const currentExpires = new Date(data.expiresAt);
      const reservedAt = new Date(data.reservedAt);
      const currentDuration = (currentExpires.getTime() - reservedAt.getTime()) / (1000 * 60);

      // Verificar limite máximo
      if (currentDuration + additionalMinutes > this.defaultConfig.maxReservationTime) {
        return { 
          success: false, 
          message: `Não é possível estender. Tempo máximo: ${this.defaultConfig.maxReservationTime} minutos` 
        };
      }

      const newExpiresAt = new Date(currentExpires.getTime() + additionalMinutes * 60 * 1000);

      // Atualizar reserva
      await strapi.entityService.update('api::audit-log.audit-log', activeReservation.id, {
        data: {
          newData: {
            ...data,
            expiresAt: newExpiresAt.toISOString(),
            extendedAt: new Date().toISOString(),
            additionalMinutes
          } as any
        }
      });

      console.log(`[CART_EXP] Reserva estendida - Carrinho: ${cartOrderId}, Nova expiração: ${newExpiresAt.toISOString()}`);

      return { 
        success: true, 
        newExpiresAt, 
        message: `Reserva estendida por ${additionalMinutes} minutos` 
      };

    } catch (error) {
      console.error('[CART_EXP] Erro ao estender reserva:', error);
      return { success: false, message: 'Erro interno ao estender reserva' };
    }
  }

  /**
   * Obter estatísticas de reservas
   */
  public async getReservationStats() {
    try {
      const reservations = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'cart-reservation'
        }
      });

      const stats = {
        total: reservations.length,
        active: 0,
        expired: 0,
        released: 0,
        averageDuration: 0,
        mostReservedProducts: {} as Record<string, { title: string; count: number }>
      };

      let totalDuration = 0;
      let durationCount = 0;

      reservations.forEach(reservation => {
        const data = reservation.newData as any;
        
        switch (data.status) {
          case 'ACTIVE':
            // Verificar se ainda está ativo ou se expirou
            const expiresAt = new Date(data.expiresAt);
            if (new Date() > expiresAt) {
              stats.expired++;
            } else {
              stats.active++;
            }
            break;
          case 'EXPIRED':
            stats.expired++;
            break;
          case 'RELEASED':
            stats.released++;
            break;
        }

        // Calcular duração média
        if (data.reservedAt && data.expiresAt) {
          const duration = (new Date(data.expiresAt).getTime() - new Date(data.reservedAt).getTime()) / (1000 * 60);
          totalDuration += duration;
          durationCount++;
        }

        // Produtos mais reservados
        if (data.productTitle) {
          if (!stats.mostReservedProducts[data.productId]) {
            stats.mostReservedProducts[data.productId] = {
              title: data.productTitle,
              count: 0
            };
          }
          stats.mostReservedProducts[data.productId].count++;
        }
      });

      stats.averageDuration = durationCount > 0 ? totalDuration / durationCount : 0;

      return stats;

    } catch (error) {
      console.error('[CART_EXP] Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * Marcar reserva como expirada
   */
  private async markAsExpired(reservationId: string, data: any): Promise<void> {
    try {
      await strapi.entityService.update('api::audit-log.audit-log', reservationId, {
        data: {
          newData: {
            ...data,
            status: 'EXPIRED',
            expiredAt: new Date().toISOString()
          } as any
        }
      });
    } catch (error) {
      console.error('[CART_EXP] Erro ao marcar reserva como expirada:', error);
    }
  }

  /**
   * Liberar estoque de reserva expirada
   */
  private async releaseStockForExpiredReservation(reservationData: any): Promise<void> {
    try {
      // Buscar o cartOrder correspondente
      const cartOrder = await strapi.entityService.findOne('api::card-order.card-order', reservationData.cartOrderId);
      
      if (cartOrder) {
        // Remover item do carrinho se ainda existir
        await strapi.entityService.delete('api::card-order.card-order', reservationData.cartOrderId);
        console.log(`[CART_EXP] Item removido do carrinho por expiração - ID: ${reservationData.cartOrderId}`);
      }

    } catch (error) {
      console.error('[CART_EXP] Erro ao liberar estoque de reserva expirada:', error);
      // Não falhar o processo se não conseguir liberar
    }
  }

  /**
   * Executar limpeza automática periodicamente
   */
  public async startPeriodicCleanup(): Promise<void> {
    const intervalMinutes = this.defaultConfig.cleanupIntervalMinutes;
    
    console.log(`[CART_EXP] Iniciando limpeza automática a cada ${intervalMinutes} minutos...`);
    
    setInterval(async () => {
      try {
        await this.cleanupExpiredReservations();
      } catch (error) {
        console.error('[CART_EXP] Erro na limpeza automática:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }
}