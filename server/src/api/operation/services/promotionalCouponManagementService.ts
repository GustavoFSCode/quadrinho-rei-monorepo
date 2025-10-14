/**
 * Service de Gestão de Cupons Promocionais Simplificado
 * CRUD básico para cupons promocionais
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
import { getBrazilDate } from '../../../utils/dateUtils';

export class PromotionalCouponManagementService {

  /**
   * Criar cupom promocional simples
   */
  public async createPromotionalCoupon(ctx: any) {
    try {
      const body = ctx.request.body;
      const { title, usageLimit, price } = body;

      console.log('[PROMO_COUPON] Criando cupom promocional:', { title, usageLimit, price });

      // Validações básicas
      if (!title || !usageLimit || !price) {
        throw new ApplicationError('Título, quantidade de utilizações e valor são obrigatórios');
      }

      if (usageLimit < 1) {
        throw new ApplicationError('Quantidade de utilizações deve ser maior que zero');
      }

      if (price <= 0) {
        throw new ApplicationError('Valor do cupom deve ser maior que zero');
      }

      // Gerar código único
      const code = this.generateUniqueCouponCode(title);

      // Verificar se já existe cupom promocional com o mesmo título
      const existingCouponByTitle = await strapi.documents('api::coupon.coupon').findMany({
        filters: {
          title: { $eq: title },
          couponType: { $eq: 'Promocional' }
        }
      });

      if (existingCouponByTitle && existingCouponByTitle.length > 0) {
        throw new ApplicationError('Já existe um cupom promocional com este título. Escolha outro título.');
      }

      // Verificar se código já existe
      const existingCoupon = await strapi.documents('api::coupon.coupon').findMany({
        filters: {
          code: { $eq: code }
        }
      });

      if (existingCoupon && existingCoupon.length > 0) {
        throw new ApplicationError('Já existe um cupom com este código. Tente outro título.');
      }

      // Criar cupom
      const coupon = await strapi.documents('api::coupon.coupon').create({
        data: {
          code: code,
          title: title,
          price: price,
          usageLimit: usageLimit,
          usageCount: 0,
          isActive: true,
          couponType: 'Promocional',
          couponStatus: 'NaoUsado',
          expiresAt: null, // Sem expiração
          createdAt: getBrazilDate(),
          publishedAt: getBrazilDate()
        }
      });

      console.log('[PROMO_COUPON] Cupom criado:', coupon.code);

      return {
        success: true,
        message: 'Cupom promocional criado com sucesso!',
        data: coupon
      };

    } catch (error) {
      console.error('[PROMO_COUPON] Erro ao criar cupom:', error);
      throw error;
    }
  }

  /**
   * Listar cupons promocionais
   */
  public async getPromotionalCoupons(ctx: any) {
    try {
      const query = ctx.request.query;

      const filters: any = {
        couponType: { $eq: 'Promocional' }
      };

      const coupons = await strapi.documents('api::coupon.coupon').findMany({
        filters,
        populate: {
          purchase: {
            populate: {
              client: {
                fields: ['name']
              }
            }
          }
        },
        sort: ['createdAt:desc']
      });

      // Formatar resposta
      const formattedCoupons = coupons.map((coupon: any) => ({
        id: coupon.id,
        documentId: coupon.documentId,
        code: coupon.code,
        title: coupon.title,
        price: coupon.price,
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt
      }));

      console.log('[PROMO_COUPON] Listando cupons promocionais:', formattedCoupons.length);

      // Paginação opcional
      if (query.page && query.pageSize) {
        const page = parseInt(query.page, 10) || 1;
        const pageSize = parseInt(query.pageSize, 10) || 12;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const paginatedCoupons = formattedCoupons.slice(startIndex, endIndex);

        return {
          data: paginatedCoupons,
          pagination: {
            page,
            pageSize,
            total: formattedCoupons.length,
            pageCount: Math.ceil(formattedCoupons.length / pageSize)
          }
        };
      }

      return formattedCoupons;

    } catch (error) {
      console.error('[PROMO_COUPON] Erro ao listar cupons:', error);
      throw new ApplicationError('Erro ao listar cupons promocionais');
    }
  }

  /**
   * Obter usos de um cupom específico (agrupado por cliente)
   */
  public async getCouponUsages(ctx: any) {
    try {
      const { code } = ctx.params;

      console.log('[PROMO_COUPON] Buscando usos do cupom:', code);

      // Buscar cupom pelo código
      const coupons = await strapi.documents('api::coupon.coupon').findMany({
        filters: {
          code: { $eq: code },
          couponType: { $eq: 'Promocional' }
        }
      });

      if (!coupons || coupons.length === 0) {
        throw new ApplicationError('Cupom não encontrado');
      }

      const coupon = coupons[0];

      // Buscar todas as compras que usaram este cupom
      const purchases = await strapi.documents('api::purchase.purchase').findMany({
        filters: {
          coupons: {
            documentId: { $eq: coupon.documentId }
          },
          purchaseStatus: {
            $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']
          }
        },
        populate: {
          client: {
            fields: ['name']
          },
          coupons: true
        },
        sort: ['date:desc']
      });

      // Agrupar usos por cliente e contar quantas vezes cada cliente usou
      const usagesByClient = new Map();

      purchases.forEach((purchase: any) => {
        const clientId = purchase.client?.documentId;
        const clientName = purchase.client?.name || 'N/A';

        if (!usagesByClient.has(clientId)) {
          usagesByClient.set(clientId, {
            clientId,
            clientName,
            usageCount: 0,
            purchases: []
          });
        }

        const clientData = usagesByClient.get(clientId);
        clientData.usageCount++;
        clientData.purchases.push({
          id: purchase.id,
          documentId: purchase.documentId,
          purchaseId: purchase.documentId,
          totalValue: purchase.totalValue,
          date: purchase.date || purchase.createdAt
        });
      });

      // Formatar dados de uso (cada linha é um uso individual)
      const usages = purchases.map((purchase: any) => {
        const clientId = purchase.client?.documentId;
        const clientUsageCount = usagesByClient.get(clientId)?.usageCount || 0;

        return {
          id: purchase.id,
          documentId: purchase.documentId,
          clientName: purchase.client?.name || 'N/A',
          clientUsageCount: clientUsageCount,
          purchaseId: purchase.documentId,
          totalValue: purchase.totalValue,
          date: purchase.date || purchase.createdAt
        };
      });

      const totalUniqueClients = usagesByClient.size;

      console.log('[PROMO_COUPON] Usos encontrados:', usages.length, 'de', totalUniqueClients, 'clientes únicos');

      return {
        coupon: {
          code: coupon.code,
          title: coupon.title,
          usageCount: coupon.usageCount,
          usageLimit: coupon.usageLimit,
          totalUniqueClients
        },
        usages
      };

    } catch (error) {
      console.error('[PROMO_COUPON] Erro ao buscar usos:', error);
      throw error;
    }
  }

  /**
   * Validar se cliente pode usar o cupom (verificar limite de usos por cliente)
   * @param couponTitleOrCode - Título ou código do cupom (busca por título para promocionais)
   */
  public async validateCouponUsageByClient(couponTitleOrCode: string, clientId: string): Promise<{
    canUse: boolean;
    currentUsage: number;
    usageLimit: number;
    message: string;
  }> {
    try {
      // Buscar cupom promocional por TÍTULO
      const coupons = await strapi.documents('api::coupon.coupon').findMany({
        filters: {
          title: { $eq: couponTitleOrCode },
          couponType: { $eq: 'Promocional' }
        }
      });

      if (!coupons || coupons.length === 0) {
        return {
          canUse: false,
          currentUsage: 0,
          usageLimit: 0,
          message: 'Cupom não encontrado'
        };
      }

      const coupon = coupons[0];

      // Verificar se cupom está ativo
      if (!coupon.isActive) {
        return {
          canUse: false,
          currentUsage: 0,
          usageLimit: coupon.usageLimit,
          message: 'Cupom inativo'
        };
      }

      // Buscar quantas vezes este cliente já usou o cupom
      const clientPurchases = await strapi.documents('api::purchase.purchase').findMany({
        filters: {
          client: {
            documentId: { $eq: clientId }
          },
          coupons: {
            documentId: { $eq: coupon.documentId }
          },
          purchaseStatus: {
            $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']
          }
        }
      });

      const currentUsage = clientPurchases.length;
      const canUse = currentUsage < coupon.usageLimit;

      console.log(`[PROMO_COUPON] Cliente ${clientId} - Usos do cupom ${couponTitleOrCode}: ${currentUsage}/${coupon.usageLimit}`);

      return {
        canUse,
        currentUsage,
        usageLimit: coupon.usageLimit,
        message: canUse
          ? `Cliente pode usar o cupom (${currentUsage}/${coupon.usageLimit} usos)`
          : `Cliente atingiu o limite de uso deste cupom (${currentUsage}/${coupon.usageLimit})`
      };

    } catch (error) {
      console.error('[PROMO_COUPON] Erro na validação de uso:', error);
      return {
        canUse: false,
        currentUsage: 0,
        usageLimit: 0,
        message: 'Erro ao validar cupom'
      };
    }
  }

  /**
   * Alternar status ativo/inativo do cupom
   */
  public async toggleCouponStatus(ctx: any) {
    try {
      const { id } = ctx.params;
      const { isActive } = ctx.request.body;

      console.log('[PROMO_COUPON] Alternando status do cupom:', id, 'para', isActive);

      const coupon = await strapi.documents('api::coupon.coupon').findOne({
        documentId: id
      });

      if (!coupon) {
        throw new ApplicationError('Cupom não encontrado');
      }

      if (coupon.couponType !== 'Promocional') {
        throw new ApplicationError('Apenas cupons promocionais podem ter status alterado');
      }

      // Atualizar status
      const updatedCoupon = await strapi.documents('api::coupon.coupon').update({
        documentId: id,
        data: {
          isActive: isActive,
          updatedAt: getBrazilDate()
        }
      });

      console.log('[PROMO_COUPON] Status alterado:', updatedCoupon.isActive);

      return {
        success: true,
        message: `Cupom ${isActive ? 'ativado' : 'desativado'} com sucesso!`,
        data: updatedCoupon
      };

    } catch (error) {
      console.error('[PROMO_COUPON] Erro ao alternar status:', error);
      throw error;
    }
  }

  /**
   * Deletar cupom promocional
   */
  public async deletePromotionalCoupon(ctx: any) {
    try {
      const { id } = ctx.params;

      console.log('[PROMO_COUPON] Deletando cupom:', id);

      const coupon = await strapi.documents('api::coupon.coupon').findOne({
        documentId: id
      });

      if (!coupon) {
        throw new ApplicationError('Cupom não encontrado');
      }

      if (coupon.couponType !== 'Promocional') {
        throw new ApplicationError('Apenas cupons promocionais podem ser deletados');
      }

      // Verificar se cupom já foi usado
      if (coupon.usageCount > 0) {
        throw new ApplicationError('Não é possível deletar cupom que já foi utilizado');
      }

      // Deletar cupom
      await strapi.documents('api::coupon.coupon').delete({
        documentId: id
      });

      console.log('[PROMO_COUPON] Cupom deletado:', coupon.code);

      return {
        success: true,
        message: 'Cupom deletado com sucesso!'
      };

    } catch (error) {
      console.error('[PROMO_COUPON] Erro ao deletar cupom:', error);
      throw error;
    }
  }

  /**
   * Gerar código único para cupom
   */
  private generateUniqueCouponCode(title: string): string {
    // Remover espaços e caracteres especiais
    const cleanTitle = title
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z0-9]/g, '') // Remove caracteres especiais
      .substring(0, 10); // Limitar a 10 caracteres

    // Adicionar sufixo aleatório
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${cleanTitle}-${randomSuffix}`;
  }
}
