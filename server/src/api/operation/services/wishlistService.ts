/**
 * Service de Wishlist/Favoritos - Melhoria UX
 * Sistema de lista de desejos para clientes
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface WishlistItem {
  id: string;
  clientId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  addedAt: Date;
  isAvailable: boolean;
  notifyOnDiscount: boolean;
  notifyOnStock: boolean;
}

export class WishlistService {

  /**
   * Adicionar produto à wishlist
   */
  public async addToWishlist(clientId: string, productId: string, notifications: { discount: boolean; stock: boolean } = { discount: true, stock: true }): Promise<WishlistItem> {
    console.log(`[WISHLIST] Adicionando produto ${productId} à wishlist do cliente ${clientId}`);

    try {
      // Verificar se produto existe
      const product = await strapi.entityService.findOne('api::product.product', productId);
      if (!product) {
        throw new ApplicationError('Produto não encontrado');
      }

      // Verificar se já está na wishlist
      const existing = await this.getWishlistItem(clientId, productId);
      if (existing) {
        throw new ApplicationError('Produto já está na sua lista de desejos');
      }

      const item: WishlistItem = {
        id: `wish_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        clientId,
        productId,
        productTitle: product.title || '',
        productPrice: (product as any).priceSell || 0,
        addedAt: new Date(),
        isAvailable: (product as any).stock > 0,
        notifyOnDiscount: notifications.discount,
        notifyOnStock: notifications.stock
      };

      // Salvar na wishlist
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'wishlist',
          entityId: item.id,
          userId: parseInt(clientId),
          userEmail: `client-${clientId}`,
          oldData: null,
          newData: {
            wishlistType: 'WISHLIST_ITEM',
            ...item
          } as any,
          changedFields: ['wishlist.added'],
          timestamp: item.addedAt,
          ipAddress: 'system',
          userAgent: 'wishlist-service'
        }
      });

      console.log(`[WISHLIST] Produto adicionado à wishlist: ${item.productTitle}`);
      return item;

    } catch (error) {
      console.error('[WISHLIST] Erro ao adicionar à wishlist:', error);
      throw error;
    }
  }

  /**
   * Remover da wishlist
   */
  public async removeFromWishlist(clientId: string, productId: string): Promise<void> {
    try {
      const existing = await this.getWishlistItem(clientId, productId);
      if (!existing) {
        throw new ApplicationError('Item não encontrado na lista de desejos');
      }

      // Marcar como removido
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'DELETE',
          entityName: 'wishlist',
          entityId: existing.id,
          userId: parseInt(clientId),
          userEmail: `client-${clientId}`,
          oldData: existing as any,
          newData: {
            wishlistType: 'WISHLIST_ITEM',
            ...existing,
            removed: true,
            removedAt: new Date()
          } as any,
          changedFields: ['wishlist.removed'],
          timestamp: new Date(),
          ipAddress: 'system',
          userAgent: 'wishlist-service'
        }
      });

      console.log(`[WISHLIST] Item removido da wishlist: ${existing.productTitle}`);

    } catch (error) {
      console.error('[WISHLIST] Erro ao remover da wishlist:', error);
      throw error;
    }
  }

  /**
   * Obter wishlist do cliente
   */
  public async getClientWishlist(clientId: string): Promise<WishlistItem[]> {
    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'wishlist',
          userId: parseInt(clientId)
        },
        sort: ['timestamp:desc']
      });

      const itemMap = new Map<string, any>();

      auditLogs.forEach((log: any) => {
        const itemData = log.newData;
        if (itemData?.wishlistType === 'WISHLIST_ITEM') {
          const productId = itemData.productId;
          
          // Pegar a versão mais recente (incluindo remoções)
          if (!itemMap.has(productId) || 
              new Date(log.timestamp) > new Date(itemMap.get(productId).timestamp)) {
            itemMap.set(productId, { ...itemData, timestamp: log.timestamp });
          }
        }
      });

      // Filtrar apenas itens não removidos
      return Array.from(itemMap.values()).filter(item => !item.removed);

    } catch (error) {
      console.error('[WISHLIST] Erro ao buscar wishlist:', error);
      return [];
    }
  }

  /**
   * Verificar disponibilidade dos itens
   */
  public async checkWishlistAvailability(clientId: string) {
    try {
      const wishlist = await this.getClientWishlist(clientId);
      const updates = [];

      for (const item of wishlist) {
        const product = await strapi.entityService.findOne('api::product.product', item.productId);
        if (product) {
          const isAvailable = (product as any).stock > 0;
          const currentPrice = (product as any).priceSell || 0;
          
          if (isAvailable !== item.isAvailable || currentPrice !== item.productPrice) {
            updates.push({
              item,
              newAvailability: isAvailable,
              newPrice: currentPrice,
              priceChange: currentPrice - item.productPrice
            });
          }
        }
      }

      return {
        success: true,
        checkedItems: wishlist.length,
        updates,
        notifications: updates.filter(u => 
          (u.newAvailability && !u.item.isAvailable && u.item.notifyOnStock) ||
          (u.priceChange < 0 && u.item.notifyOnDiscount)
        )
      };

    } catch (error) {
      console.error('[WISHLIST] Erro ao verificar disponibilidade:', error);
      throw error;
    }
  }

  private async getWishlistItem(clientId: string, productId: string): Promise<WishlistItem | null> {
    try {
      const wishlist = await this.getClientWishlist(clientId);
      return wishlist.find(item => item.productId === productId) || null;
    } catch (error) {
      return null;
    }
  }
}