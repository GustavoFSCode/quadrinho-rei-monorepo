/**
 * Service de Ranking Inteligente de Clientes - RN0027
 * Implementa cálculo automático de ranking baseado em comportamento de compras
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface RankingCriteria {
  totalSpent: number;           // Total gasto pelo cliente
  orderCount: number;           // Número de pedidos
  averageOrderValue: number;    // Valor médio dos pedidos
  frequency: number;            // Frequência de compras (dias entre compras)
  recency: number;              // Dias desde última compra
  completionRate: number;       // Taxa de pedidos concluídos vs cancelados
  loyaltyDays: number;          // Dias como cliente ativo
  reviewsGiven: number;         // Número de avaliações dadas
}

export interface ClientRankingResult {
  clientId: string;
  clientName: string;
  currentRanking: number;
  newRanking: number;
  score: number;
  criteria: RankingCriteria;
  tier: 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE' | 'VIP';
  benefits: string[];
  lastCalculated: Date;
}

export interface RankingConfiguration {
  weights: {
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    frequency: number;
    recency: number;
    completionRate: number;
    loyalty: number;
    engagement: number;
  };
  tiers: {
    bronze: { min: number; max: number };
    prata: { min: number; max: number };
    ouro: { min: number; max: number };
    diamante: { min: number; max: number };
    vip: { min: number; max: number };
  };
  benefits: {
    bronze: string[];
    prata: string[];
    ouro: string[];
    diamante: string[];
    vip: string[];
  };
}

export class ClientRankingService {

  private config: RankingConfiguration = {
    weights: {
      totalSpent: 0.30,         // 30% - Valor total gasto
      orderCount: 0.15,         // 15% - Número de pedidos
      averageOrderValue: 0.15,  // 15% - Valor médio por pedido
      frequency: 0.10,          // 10% - Frequência de compras
      recency: 0.10,            // 10% - Recência das compras
      completionRate: 0.10,     // 10% - Taxa de conclusão
      loyalty: 0.05,            // 5% - Tempo como cliente
      engagement: 0.05          // 5% - Engajamento (avaliações)
    },
    tiers: {
      bronze: { min: 0, max: 20 },
      prata: { min: 21, max: 40 },
      ouro: { min: 41, max: 65 },
      diamante: { min: 66, max: 85 },
      vip: { min: 86, max: 100 }
    },
    benefits: {
      bronze: ['Desconto de 2% em compras', 'Frete grátis acima de R$50'],
      prata: ['Desconto de 5% em compras', 'Frete grátis acima de R$30', 'Acesso a promoções exclusivas'],
      ouro: ['Desconto de 8% em compras', 'Frete grátis em todas as compras', 'Acesso antecipado a lançamentos'],
      diamante: ['Desconto de 12% em compras', 'Frete grátis premium', 'Suporte prioritário', 'Cupons mensais'],
      vip: ['Desconto de 15% em compras', 'Frete grátis express', 'Gerente de conta dedicado', 'Eventos exclusivos']
    }
  };

  /**
   * RN0027 - Calcular ranking para um cliente específico
   */
  public async calculateClientRanking(clientId: string): Promise<ClientRankingResult> {
    console.log(`[RANKING] Calculando ranking para cliente ${clientId}`);

    try {
      // Buscar dados do cliente
      const client = await strapi.entityService.findOne('api::client.client', clientId, {
        populate: {
          purchases: {
            populate: {
              purchaseSalesStatus: true,
              cartOrders: true
            }
          }
        }
      });

      if (!client) {
        throw new ApplicationError('Cliente não encontrado');
      }

      const clientData = client as any;
      const purchases = clientData.purchases || [];

      // Calcular critérios de ranking
      const criteria = await this.calculateRankingCriteria(clientId, purchases);

      // Calcular score baseado nos pesos configurados
      const score = this.calculateWeightedScore(criteria);

      // Determinar tier baseado no score
      const tier = this.determineTier(score);

      // Buscar ranking atual
      const currentRanking = clientData.ranking || 0;

      const result: ClientRankingResult = {
        clientId,
        clientName: clientData.name || 'Cliente',
        currentRanking,
        newRanking: Math.round(score),
        score,
        criteria,
        tier,
        benefits: this.config.benefits[tier.toLowerCase() as keyof typeof this.config.benefits],
        lastCalculated: new Date()
      };

      console.log(`[RANKING] ✅ Ranking calculado - Cliente: ${result.clientName}, Score: ${score.toFixed(2)}, Tier: ${tier}`);

      // Registrar para auditoria
      await this.logRankingCalculation(result);

      return result;

    } catch (error) {
      console.error('[RANKING] Erro no cálculo de ranking:', error);
      throw error;
    }
  }

  /**
   * Calcular critérios detalhados de ranking
   */
  private async calculateRankingCriteria(clientId: string, purchases: any[]): Promise<RankingCriteria> {
    const now = new Date();
    const validPurchases = purchases.filter((p: any) => 
      p.purchaseSalesStatus?.name === 'APROVADA' || 
      p.purchaseSalesStatus?.name === 'ENTREGUE'
    );

    // 1. Total gasto
    const totalSpent = validPurchases.reduce((sum, p) => sum + (p.totalValue || 0), 0);

    // 2. Número de pedidos
    const orderCount = validPurchases.length;

    // 3. Valor médio por pedido
    const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

    // 4. Frequência de compras (média de dias entre compras)
    let frequency = 0;
    if (orderCount > 1) {
      const sortedPurchases = validPurchases.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      let totalDaysBetween = 0;
      for (let i = 1; i < sortedPurchases.length; i++) {
        const daysDiff = (new Date(sortedPurchases[i].date).getTime() - 
                         new Date(sortedPurchases[i-1].date).getTime()) / (1000 * 60 * 60 * 24);
        totalDaysBetween += daysDiff;
      }
      frequency = totalDaysBetween / (orderCount - 1);
    }

    // 5. Recência (dias desde última compra)
    let recency = 365; // Default para clientes sem compras
    if (orderCount > 0) {
      const lastPurchase = validPurchases.reduce((latest, p) => 
        new Date(p.date) > new Date(latest.date) ? p : latest
      );
      recency = (now.getTime() - new Date(lastPurchase.date).getTime()) / (1000 * 60 * 60 * 24);
    }

    // 6. Taxa de conclusão (aprovadas vs canceladas)
    const allPurchases = purchases;
    const cancelledCount = allPurchases.filter((p: any) => 
      p.purchaseSalesStatus?.name === 'CANCELADA' || 
      p.purchaseSalesStatus?.name === 'REPROVADA'
    ).length;
    const completionRate = allPurchases.length > 0 
      ? (validPurchases.length / allPurchases.length) * 100 
      : 100;

    // 7. Dias como cliente ativo (desde primeira compra)
    let loyaltyDays = 0;
    if (orderCount > 0) {
      const firstPurchase = validPurchases.reduce((earliest, p) => 
        new Date(p.date) < new Date(earliest.date) ? p : earliest
      );
      loyaltyDays = (now.getTime() - new Date(firstPurchase.date).getTime()) / (1000 * 60 * 60 * 24);
    }

    // 8. Número de avaliações (engagement)
    const reviewsGiven = await this.getClientReviewsCount(clientId);

    return {
      totalSpent,
      orderCount,
      averageOrderValue,
      frequency,
      recency,
      completionRate,
      loyaltyDays,
      reviewsGiven
    };
  }

  /**
   * Calcular score ponderado baseado nos critérios
   */
  private calculateWeightedScore(criteria: RankingCriteria): number {
    // Normalizar valores para escala 0-100
    
    // 1. Total gasto (normalizar baseado em faixas)
    const spentScore = Math.min((criteria.totalSpent / 5000) * 100, 100); // R$5000 = score máximo
    
    // 2. Número de pedidos (normalizar baseado em faixas)
    const orderScore = Math.min((criteria.orderCount / 50) * 100, 100); // 50 pedidos = score máximo
    
    // 3. Valor médio por pedido
    const avgScore = Math.min((criteria.averageOrderValue / 500) * 100, 100); // R$500 = score máximo
    
    // 4. Frequência (quanto menor, melhor - compras mais frequentes)
    const freqScore = criteria.frequency > 0 
      ? Math.max(100 - (criteria.frequency / 30) * 100, 0) // 30 dias = score mínimo
      : 0;
    
    // 5. Recência (quanto menor, melhor - compras mais recentes)
    const recencyScore = Math.max(100 - (criteria.recency / 90) * 100, 0); // 90 dias = score mínimo
    
    // 6. Taxa de conclusão (já em percentual)
    const completionScore = criteria.completionRate;
    
    // 7. Lealdade (dias como cliente)
    const loyaltyScore = Math.min((criteria.loyaltyDays / 365) * 100, 100); // 1 ano = score máximo
    
    // 8. Engajamento (avaliações)
    const engagementScore = Math.min((criteria.reviewsGiven / 20) * 100, 100); // 20 avaliações = score máximo

    // Aplicar pesos e calcular score final
    const weightedScore = 
      (spentScore * this.config.weights.totalSpent) +
      (orderScore * this.config.weights.orderCount) +
      (avgScore * this.config.weights.averageOrderValue) +
      (freqScore * this.config.weights.frequency) +
      (recencyScore * this.config.weights.recency) +
      (completionScore * this.config.weights.completionRate) +
      (loyaltyScore * this.config.weights.loyalty) +
      (engagementScore * this.config.weights.engagement);

    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Determinar tier baseado no score
   */
  private determineTier(score: number): ClientRankingResult['tier'] {
    const tiers = this.config.tiers;
    
    if (score >= tiers.vip.min && score <= tiers.vip.max) return 'VIP';
    if (score >= tiers.diamante.min && score <= tiers.diamante.max) return 'DIAMANTE';
    if (score >= tiers.ouro.min && score <= tiers.ouro.max) return 'OURO';
    if (score >= tiers.prata.min && score <= tiers.prata.max) return 'PRATA';
    return 'BRONZE';
  }

  /**
   * Buscar número de avaliações do cliente
   */
  private async getClientReviewsCount(clientId: string): Promise<number> {
    try {
      const reviews = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'product-review',
          userEmail: `client-${clientId}`
        }
      });

      return reviews.filter((log: any) => {
        const data = log.newData as any;
        return data?.reviewType === 'PRODUCT_REVIEW';
      }).length;

    } catch (error) {
      console.error('[RANKING] Erro ao buscar avaliações do cliente:', error);
      return 0;
    }
  }

  /**
   * Recalcular ranking para todos os clientes
   */
  public async recalculateAllClientRankings(): Promise<{
    processed: number;
    updated: number;
    errors: number;
    summary: Record<string, number>;
  }> {
    console.log('[RANKING] Iniciando recálculo de ranking para todos os clientes...');

    let processed = 0;
    let updated = 0;
    let errors = 0;
    const summary: Record<string, number> = {
      BRONZE: 0,
      PRATA: 0,
      OURO: 0,
      DIAMANTE: 0,
      VIP: 0
    };

    try {
      // Buscar todos os clientes ativos
      const clients = await strapi.entityService.findMany('api::client.client', {
        fields: ['name'] as any
      }) as any;

      console.log(`[RANKING] Processando ${clients.length} clientes...`);

      for (const client of clients) {
        processed++;

        try {
          const result = await this.calculateClientRanking(client.documentId);
          
          // Atualizar ranking no banco
          await strapi.entityService.update('api::client.client', client.documentId, {
            data: {
              ranking: result.newRanking,
              rankingTier: result.tier,
              lastRankingUpdate: new Date()
            }
          });

          updated++;
          summary[result.tier]++;

          console.log(`[RANKING] Cliente atualizado: ${result.clientName} - ${result.tier} (${result.newRanking})`);

        } catch (clientError) {
          errors++;
          console.error(`[RANKING] Erro ao processar cliente ${client.name}:`, clientError);
        }
      }

      console.log(`[RANKING] ✅ Recálculo concluído - Processados: ${processed}, Atualizados: ${updated}, Erros: ${errors}`);

      return { processed, updated, errors, summary };

    } catch (error) {
      console.error('[RANKING] Erro no recálculo geral:', error);
      return { processed, updated, errors, summary };
    }
  }

  /**
   * Obter estatísticas de ranking
   */
  public async getRankingStats() {
    try {
      const clients = await strapi.entityService.findMany('api::client.client', {
        fields: ['ranking', 'rankingTier', 'name'] as any
      }) as any;

      const stats = {
        totalClients: clients.length,
        tierDistribution: {
          BRONZE: 0,
          PRATA: 0,
          OURO: 0,
          DIAMANTE: 0,
          VIP: 0
        },
        averageRanking: 0,
        topClients: [] as Array<{ name: string; ranking: number; tier: string }>,
        rankingRange: { min: 100, max: 0 }
      };

      let totalRanking = 0;
      const clientsList: Array<{ name: string; ranking: number; tier: string }> = [];

      clients.forEach((client: any) => {
        const ranking = client.ranking || 0;
        const tier = client.rankingTier || 'BRONZE';
        
        totalRanking += ranking;
        stats.tierDistribution[tier as keyof typeof stats.tierDistribution]++;
        
        clientsList.push({
          name: client.name || 'Cliente sem nome',
          ranking,
          tier
        });

        if (ranking < stats.rankingRange.min) stats.rankingRange.min = ranking;
        if (ranking > stats.rankingRange.max) stats.rankingRange.max = ranking;
      });

      stats.averageRanking = clients.length > 0 ? totalRanking / clients.length : 0;
      stats.topClients = clientsList
        .sort((a, b) => b.ranking - a.ranking)
        .slice(0, 10);

      return stats;

    } catch (error) {
      console.error('[RANKING] Erro ao gerar estatísticas:', error);
      return null;
    }
  }

  /**
   * Registrar cálculo de ranking para auditoria
   */
  private async logRankingCalculation(result: ClientRankingResult): Promise<void> {
    try {
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'UPDATE',
          entityName: 'client-ranking',
          entityId: result.clientId,
          userId: null,
          userEmail: 'system-ranking',
          oldData: { ranking: result.currentRanking } as any,
          newData: {
            calculationType: 'CLIENT_RANKING_UPDATE',
            ...result,
            config: this.config
          } as any,
          changedFields: ['ranking', 'tier'],
          timestamp: result.lastCalculated,
          ipAddress: 'system',
          userAgent: 'client-ranking-service'
        }
      });
    } catch (error) {
      console.error('[RANKING] Erro ao registrar auditoria:', error);
    }
  }

  /**
   * Atualizar configuração de ranking
   */
  public async updateRankingConfig(newConfig: Partial<RankingConfiguration>) {
    this.config = {
      ...this.config,
      ...newConfig
    };

    console.log('[RANKING] Configuração atualizada:', this.config);
    return this.config;
  }

  /**
   * Obter benefícios de um cliente baseado no tier
   */
  public async getClientBenefits(clientId: string): Promise<{
    tier: string;
    ranking: number;
    benefits: string[];
    nextTierRequirements?: { tier: string; minScore: number; gap: number };
  }> {
    try {
      const client = await strapi.entityService.findOne('api::client.client', clientId, {
        fields: ['ranking', 'rankingTier', 'name'] as any
      }) as any;

      if (!client) {
        throw new ApplicationError('Cliente não encontrado');
      }

      const clientData = client as any;
      const tier = clientData.rankingTier || 'BRONZE';
      const ranking = clientData.ranking || 0;
      const benefits = this.config.benefits[tier.toLowerCase() as keyof typeof this.config.benefits] || [];

      // Calcular próximo tier
      let nextTierRequirements;
      const tiers = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE', 'VIP'];
      const currentIndex = tiers.indexOf(tier);
      
      if (currentIndex < tiers.length - 1) {
        const nextTier = tiers[currentIndex + 1];
        const nextTierMin = this.config.tiers[nextTier.toLowerCase() as keyof typeof this.config.tiers].min;
        
        nextTierRequirements = {
          tier: nextTier,
          minScore: nextTierMin,
          gap: nextTierMin - ranking
        };
      }

      return {
        tier,
        ranking,
        benefits,
        nextTierRequirements
      };

    } catch (error) {
      console.error('[RANKING] Erro ao buscar benefícios do cliente:', error);
      throw error;
    }
  }
}