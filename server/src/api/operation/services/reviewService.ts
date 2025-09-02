/**
 * Service de Reviews e Avaliações - Melhoria UX
 * Sistema de avaliações e comentários de produtos
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface ProductReview {
  id: string;
  productId: string;
  clientId: string;
  clientName: string;
  purchaseId?: string;
  rating: number; // 1-5 estrelas
  title: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerifiedPurchase: boolean;
  createdAt: Date;
  moderatedAt?: Date;
  moderatedBy?: string;
  photos?: string[];
}

export interface ProductRatingStats {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  verifiedPurchasePercentage: number;
  helpfulnessScore: number;
}

export class ReviewService {

  /**
   * Criar avaliação de produto
   */
  public async createReview(reviewData: {
    productId: string;
    clientId: string;
    rating: number;
    title: string;
    comment: string;
    purchaseId?: string;
    photos?: string[];
  }): Promise<ProductReview> {

    console.log(`[REVIEW] Criando avaliação para produto ${reviewData.productId}`);

    try {
      // Validações
      if (!reviewData.productId || !reviewData.clientId) {
        throw new ApplicationError('Product ID e Client ID são obrigatórios');
      }

      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new ApplicationError('Avaliação deve ser entre 1 e 5 estrelas');
      }

      // Verificar se produto existe
      const product = await strapi.entityService.findOne('api::product.product', reviewData.productId);
      if (!product) {
        throw new ApplicationError('Produto não encontrado');
      }

      // Verificar se cliente já avaliou este produto
      const existingReview = await this.getClientProductReview(reviewData.clientId, reviewData.productId);
      if (existingReview) {
        throw new ApplicationError('Você já avaliou este produto');
      }

      // Buscar dados do cliente
      const client = await strapi.entityService.findOne('api::client.client', reviewData.clientId);
      if (!client) {
        throw new ApplicationError('Cliente não encontrado');
      }

      // Verificar se é compra verificada
      let isVerifiedPurchase = false;
      if (reviewData.purchaseId) {
        const purchase = await strapi.entityService.findOne('api::purchase.purchase', reviewData.purchaseId, {
          populate: {
            cartOrders: {
              populate: {
                product: {
                  fields: ['id']
                }
              }
            }
          }
        });

        if (purchase && (purchase as any).cartOrders) {
          isVerifiedPurchase = (purchase as any).cartOrders.some((order: any) => 
            order.product?.documentId === reviewData.productId
          );
        }
      }

      const review: ProductReview = {
        id: `review_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        productId: reviewData.productId,
        clientId: reviewData.clientId,
        clientName: client.name || 'Cliente',
        purchaseId: reviewData.purchaseId,
        rating: reviewData.rating,
        title: reviewData.title.trim(),
        comment: reviewData.comment.trim(),
        helpful: 0,
        notHelpful: 0,
        status: 'PENDING', // Requer moderação
        isVerifiedPurchase,
        createdAt: new Date(),
        photos: reviewData.photos || []
      };

      // Salvar review
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'product-review',
          entityId: review.id,
          userId: parseInt(reviewData.clientId),
          userEmail: `client-${reviewData.clientId}`,
          oldData: null,
          newData: {
            reviewType: 'PRODUCT_REVIEW',
            ...review
          } as any,
          changedFields: ['review.created'],
          timestamp: review.createdAt,
          ipAddress: 'system',
          userAgent: 'review-service'
        }
      });

      console.log(`[REVIEW] Avaliação criada: ${review.title} (${review.rating} estrelas)`);
      return review;

    } catch (error) {
      console.error('[REVIEW] Erro ao criar avaliação:', error);
      throw error;
    }
  }

  /**
   * Obter avaliações de um produto
   */
  public async getProductReviews(productId: string, filters: {
    status?: 'APPROVED' | 'PENDING' | 'REJECTED';
    minRating?: number;
    verifiedOnly?: boolean;
    sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    reviews: ProductReview[];
    total: number;
    stats: ProductRatingStats;
  }> {

    try {
      const allReviews = await this.getAllProductReviews(productId);
      
      // Aplicar filtros
      let filteredReviews = allReviews;

      if (filters.status) {
        filteredReviews = filteredReviews.filter(r => r.status === filters.status);
      }

      if (filters.minRating) {
        filteredReviews = filteredReviews.filter(r => r.rating >= filters.minRating!);
      }

      if (filters.verifiedOnly) {
        filteredReviews = filteredReviews.filter(r => r.isVerifiedPurchase);
      }

      // Ordenação
      switch (filters.sortBy) {
        case 'oldest':
          filteredReviews.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          break;
        case 'rating_high':
          filteredReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating_low':
          filteredReviews.sort((a, b) => a.rating - b.rating);
          break;
        case 'helpful':
          filteredReviews.sort((a, b) => (b.helpful - b.notHelpful) - (a.helpful - a.notHelpful));
          break;
        default: // newest
          filteredReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      // Paginação
      const offset = filters.offset || 0;
      const limit = filters.limit || 10;
      const paginatedReviews = filteredReviews.slice(offset, offset + limit);

      // Calcular estatísticas
      const stats = this.calculateRatingStats(productId, allReviews.filter(r => r.status === 'APPROVED'));

      return {
        reviews: paginatedReviews,
        total: filteredReviews.length,
        stats
      };

    } catch (error) {
      console.error('[REVIEW] Erro ao buscar avaliações:', error);
      throw error;
    }
  }

  /**
   * Moderar avaliação (aprovar/rejeitar)
   */
  public async moderateReview(
    reviewId: string,
    action: 'APPROVE' | 'REJECT',
    moderatorId: string,
    reason?: string
  ): Promise<ProductReview> {

    try {
      const review = await this.getReviewById(reviewId);
      if (!review) {
        throw new ApplicationError('Avaliação não encontrada');
      }

      if (review.status !== 'PENDING') {
        throw new ApplicationError('Avaliação já foi moderada');
      }

      const updatedReview: ProductReview = {
        ...review,
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        moderatedAt: new Date(),
        moderatedBy: moderatorId
      };

      // Salvar atualização
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'UPDATE',
          entityName: 'product-review',
          entityId: reviewId,
          userId: null,
          userEmail: `moderator-${moderatorId}`,
          oldData: review as any,
          newData: {
            reviewType: 'PRODUCT_REVIEW',
            ...updatedReview,
            moderationReason: reason
          } as any,
          changedFields: ['status', 'moderatedAt', 'moderatedBy'],
          timestamp: updatedReview.moderatedAt,
          ipAddress: 'system',
          userAgent: 'review-service'
        }
      });

      console.log(`[REVIEW] Avaliação ${action === 'APPROVE' ? 'aprovada' : 'rejeitada'}: ${reviewId}`);
      return updatedReview;

    } catch (error) {
      console.error('[REVIEW] Erro na moderação:', error);
      throw error;
    }
  }

  /**
   * Marcar avaliação como útil/não útil
   */
  public async markReviewHelpful(reviewId: string, isHelpful: boolean, userId: string): Promise<void> {
    try {
      const review = await this.getReviewById(reviewId);
      if (!review) {
        throw new ApplicationError('Avaliação não encontrada');
      }

      // Verificar se usuário já votou
      const existingVote = await this.getUserReviewVote(reviewId, userId);
      if (existingVote) {
        throw new ApplicationError('Você já votou nesta avaliação');
      }

      // Registrar voto
      const voteId = `vote_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'review-vote',
          entityId: voteId,
          userId: parseInt(userId),
          userEmail: `user-${userId}`,
          oldData: null,
          newData: {
            voteType: 'REVIEW_VOTE',
            reviewId,
            userId,
            isHelpful,
            votedAt: new Date()
          } as any,
          changedFields: ['vote.created'],
          timestamp: new Date(),
          ipAddress: 'system',
          userAgent: 'review-service'
        }
      });

      // Atualizar contador na review
      const updatedReview = {
        ...review,
        helpful: review.helpful + (isHelpful ? 1 : 0),
        notHelpful: review.notHelpful + (isHelpful ? 0 : 1)
      };

      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'UPDATE',
          entityName: 'product-review',
          entityId: reviewId,
          userId: parseInt(userId),
          userEmail: `user-${userId}`,
          oldData: review as any,
          newData: {
            reviewType: 'PRODUCT_REVIEW',
            ...updatedReview
          } as any,
          changedFields: ['helpful', 'notHelpful'],
          timestamp: new Date(),
          ipAddress: 'system',
          userAgent: 'review-service'
        }
      });

      console.log(`[REVIEW] Voto registrado: ${isHelpful ? 'útil' : 'não útil'} para review ${reviewId}`);

    } catch (error) {
      console.error('[REVIEW] Erro ao registrar voto:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de avaliações
   */
  public async getReviewsStats() {
    try {
      const allReviews = await this.getAllReviews();

      const stats = {
        totalReviews: allReviews.length,
        pendingModeration: allReviews.filter(r => r.status === 'PENDING').length,
        approvedReviews: allReviews.filter(r => r.status === 'APPROVED').length,
        rejectedReviews: allReviews.filter(r => r.status === 'REJECTED').length,
        averageRating: 0,
        verifiedPurchaseRate: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        topRatedProducts: [] as Array<{ productId: string; averageRating: number; reviewCount: number }>
      };

      const approvedReviews = allReviews.filter(r => r.status === 'APPROVED');

      if (approvedReviews.length > 0) {
        stats.averageRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
        stats.verifiedPurchaseRate = (approvedReviews.filter(r => r.isVerifiedPurchase).length / approvedReviews.length) * 100;

        // Distribuição de ratings
        approvedReviews.forEach(review => {
          stats.ratingDistribution[review.rating]++;
        });

        // Top produtos avaliados
        const productRatings: Record<string, { ratings: number[]; count: number }> = {};
        
        approvedReviews.forEach(review => {
          if (!productRatings[review.productId]) {
            productRatings[review.productId] = { ratings: [], count: 0 };
          }
          productRatings[review.productId].ratings.push(review.rating);
          productRatings[review.productId].count++;
        });

        stats.topRatedProducts = Object.entries(productRatings)
          .map(([productId, data]) => ({
            productId,
            averageRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
            reviewCount: data.count
          }))
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 10);
      }

      return stats;

    } catch (error) {
      console.error('[REVIEW] Erro ao gerar estatísticas:', error);
      throw error;
    }
  }

  // Métodos auxiliares privados

  private async getClientProductReview(clientId: string, productId: string): Promise<ProductReview | null> {
    try {
      const allReviews = await this.getAllProductReviews(productId);
      return allReviews.find(r => r.clientId === clientId) || null;
    } catch (error) {
      return null;
    }
  }

  private async getReviewById(reviewId: string): Promise<ProductReview | null> {
    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'product-review',
          entityId: reviewId
        },
        sort: ['timestamp:desc'],
        limit: 1
      });

      if (auditLogs.length === 0) return null;

      const reviewData = auditLogs[0].newData as any;
      if (reviewData?.reviewType === 'PRODUCT_REVIEW') {
        return reviewData;
      }

      return null;

    } catch (error) {
      return null;
    }
  }

  private async getAllProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'product-review'
        },
        sort: ['timestamp:desc']
      });

      const reviewMap = new Map<string, any>();

      auditLogs.forEach((log: any) => {
        const reviewData = log.newData;
        if (reviewData?.reviewType === 'PRODUCT_REVIEW' && reviewData.productId === productId) {
          const reviewId = log.entityId;
          if (!reviewMap.has(reviewId) || 
              new Date(log.timestamp) > new Date(reviewMap.get(reviewId).timestamp)) {
            reviewMap.set(reviewId, { ...reviewData, timestamp: log.timestamp });
          }
        }
      });

      return Array.from(reviewMap.values());

    } catch (error) {
      console.error('[REVIEW] Erro ao buscar reviews do produto:', error);
      return [];
    }
  }

  private async getAllReviews(): Promise<ProductReview[]> {
    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'product-review'
        }
      });

      const reviewMap = new Map<string, any>();

      auditLogs.forEach((log: any) => {
        const reviewData = log.newData;
        if (reviewData?.reviewType === 'PRODUCT_REVIEW') {
          const reviewId = log.entityId;
          if (!reviewMap.has(reviewId) || 
              new Date(log.timestamp) > new Date(reviewMap.get(reviewId).timestamp)) {
            reviewMap.set(reviewId, { ...reviewData, timestamp: log.timestamp });
          }
        }
      });

      return Array.from(reviewMap.values());

    } catch (error) {
      console.error('[REVIEW] Erro ao buscar todas as reviews:', error);
      return [];
    }
  }

  private async getUserReviewVote(reviewId: string, userId: string): Promise<any> {
    try {
      const votes = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'review-vote',
          userId: parseInt(userId)
        }
      });

      return votes.find((vote: any) => {
        const voteData = vote.newData;
        return voteData?.voteType === 'REVIEW_VOTE' && voteData.reviewId === reviewId;
      });

    } catch (error) {
      return null;
    }
  }

  private calculateRatingStats(productId: string, approvedReviews: ProductReview[]): ProductRatingStats {
    const stats: ProductRatingStats = {
      productId,
      averageRating: 0,
      totalReviews: approvedReviews.length,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      verifiedPurchasePercentage: 0,
      helpfulnessScore: 0
    };

    if (approvedReviews.length > 0) {
      // Média de rating
      stats.averageRating = Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length) * 10) / 10;

      // Distribuição
      approvedReviews.forEach(review => {
        stats.ratingDistribution[review.rating]++;
      });

      // Porcentagem de compras verificadas
      const verifiedCount = approvedReviews.filter(r => r.isVerifiedPurchase).length;
      stats.verifiedPurchasePercentage = Math.round((verifiedCount / approvedReviews.length) * 100);

      // Score de utilidade
      const totalVotes = approvedReviews.reduce((sum, r) => sum + r.helpful + r.notHelpful, 0);
      const helpfulVotes = approvedReviews.reduce((sum, r) => sum + r.helpful, 0);
      stats.helpfulnessScore = totalVotes > 0 ? Math.round((helpfulVotes / totalVotes) * 100) : 0;
    }

    return stats;
  }
}