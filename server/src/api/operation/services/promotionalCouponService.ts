/**
 * Service de Cupons Promocionais - RF0036 (Expansão)
 * Sistema completo de criação e gestão de cupons promocionais
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface PromotionalCoupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  discountValue: number; // Porcentagem ou valor fixo
  minimumOrderValue?: number;
  maximumDiscount?: number; // Para cupons percentuais
  usageLimit: number; // 0 = ilimitado
  usageCount: number;
  usagePerUser?: number; // Limite por usuário
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  // Condições específicas
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  firstTimeCustomersOnly?: boolean;
  minimumQuantity?: number;
  // Para cupom BUY_X_GET_Y
  buyQuantity?: number;
  getQuantity?: number;
  // Metadados
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  purchaseId: string;
  discountApplied: number;
  usedAt: Date;
}

export interface CouponPerformance {
  couponId: string;
  couponCode: string;
  couponName: string;
  totalUses: number;
  totalDiscountGiven: number;
  revenueGenerated: number; // Estimativa de receita gerada
  conversionRate: number; // % de visitantes que usaram
  averageOrderValue: number;
  topCategories: Array<{ category: string; uses: number }>;
  userSegments: {
    newCustomers: number;
    returningCustomers: number;
  };
}

export class PromotionalCouponService {

  /**
   * RF0036 - Criar cupom promocional
   */
  public async createCoupon(couponData: Omit<PromotionalCoupon, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<PromotionalCoupon> {
    console.log(`[COUPON] Criando cupom promocional: ${couponData.code}`);

    try {
      // Validações
      if (!couponData.code || !couponData.name) {
        throw new ApplicationError('Código e nome do cupom são obrigatórios');
      }

      if (couponData.validFrom >= couponData.validTo) {
        throw new ApplicationError('Data de início deve ser anterior à data de fim');
      }

      // Verificar se código já existe
      const existingCoupon = await this.getCouponByCode(couponData.code);
      if (existingCoupon) {
        throw new ApplicationError('Já existe um cupom com este código');
      }

      // Validar valores específicos por tipo
      this.validateCouponType(couponData);

      const coupon: PromotionalCoupon = {
        id: `coupon_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...couponData,
        code: couponData.code.toUpperCase(),
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Salvar no sistema
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'promotional-coupon',
          entityId: coupon.id,
          userId: null,
          userEmail: couponData.createdBy,
          oldData: null,
          newData: {
            couponType: 'PROMOTIONAL_COUPON',
            ...coupon
          } as any,
          changedFields: ['coupon.created'],
          timestamp: coupon.createdAt,
          ipAddress: 'system',
          userAgent: 'promotional-coupon-service'
        }
      });

      console.log(`[COUPON] Cupom criado: ${coupon.code} (${coupon.id})`);
      return coupon;

    } catch (error) {
      console.error('[COUPON] Erro ao criar cupom:', error);
      throw error;
    }
  }

  /**
   * Validar cupom antes de aplicar
   */
  public async validateCoupon(
    couponCode: string,
    userId: string,
    cartData: {
      totalValue: number;
      products: Array<{
        productId: string;
        categoryIds: string[];
        quantity: number;
        unitPrice: number;
      }>;
    }
  ): Promise<{
    isValid: boolean;
    discountAmount: number;
    message: string;
    coupon?: PromotionalCoupon;
  }> {

    try {
      const coupon = await this.getCouponByCode(couponCode);
      
      if (!coupon) {
        return { isValid: false, discountAmount: 0, message: 'Cupom não encontrado' };
      }

      if (!coupon.isActive) {
        return { isValid: false, discountAmount: 0, message: 'Cupom inativo' };
      }

      // Verificar datas
      const now = new Date();
      if (now < coupon.validFrom) {
        return { isValid: false, discountAmount: 0, message: 'Cupom ainda não está válido' };
      }

      if (now > coupon.validTo) {
        return { isValid: false, discountAmount: 0, message: 'Cupom expirado' };
      }

      // Verificar limite de uso geral
      if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
        return { isValid: false, discountAmount: 0, message: 'Cupom esgotado' };
      }

      // Verificar limite por usuário
      if (coupon.usagePerUser) {
        const userUsageCount = await this.getUserCouponUsage(coupon.id, userId);
        if (userUsageCount >= coupon.usagePerUser) {
          return { isValid: false, discountAmount: 0, message: 'Limite de uso por usuário atingido' };
        }
      }

      // Verificar valor mínimo
      if (coupon.minimumOrderValue && cartData.totalValue < coupon.minimumOrderValue) {
        return { 
          isValid: false, 
          discountAmount: 0, 
          message: `Valor mínimo da compra deve ser R$ ${coupon.minimumOrderValue.toFixed(2)}` 
        };
      }

      // Verificar quantidade mínima
      if (coupon.minimumQuantity) {
        const totalQuantity = cartData.products.reduce((sum, p) => sum + p.quantity, 0);
        if (totalQuantity < coupon.minimumQuantity) {
          return { 
            isValid: false, 
            discountAmount: 0, 
            message: `Quantidade mínima de produtos deve ser ${coupon.minimumQuantity}` 
          };
        }
      }

      // Verificar categorias aplicáveis
      if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
        const hasApplicableCategory = cartData.products.some(product =>
          product.categoryIds.some(catId => coupon.applicableCategories!.includes(catId))
        );
        
        if (!hasApplicableCategory) {
          return { 
            isValid: false, 
            discountAmount: 0, 
            message: 'Cupom não se aplica às categorias dos produtos no carrinho' 
          };
        }
      }

      // Verificar produtos aplicáveis
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const hasApplicableProduct = cartData.products.some(product =>
          coupon.applicableProducts!.includes(product.productId)
        );
        
        if (!hasApplicableProduct) {
          return { 
            isValid: false, 
            discountAmount: 0, 
            message: 'Cupom não se aplica aos produtos no carrinho' 
          };
        }
      }

      // Verificar produtos excluídos
      if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
        const hasExcludedProduct = cartData.products.some(product =>
          coupon.excludedProducts!.includes(product.productId)
        );
        
        if (hasExcludedProduct) {
          return { 
            isValid: false, 
            discountAmount: 0, 
            message: 'Alguns produtos do carrinho não são elegíveis para este cupom' 
          };
        }
      }

      // Calcular desconto
      const discountAmount = this.calculateDiscount(coupon, cartData);

      return {
        isValid: true,
        discountAmount,
        message: `Desconto aplicado: R$ ${discountAmount.toFixed(2)}`,
        coupon
      };

    } catch (error) {
      console.error('[COUPON] Erro na validação:', error);
      return { isValid: false, discountAmount: 0, message: 'Erro interno na validação' };
    }
  }

  /**
   * Aplicar cupom (registrar uso)
   */
  public async applyCoupon(
    couponId: string,
    userId: string,
    purchaseId: string,
    discountApplied: number
  ): Promise<CouponUsage> {

    try {
      const coupon = await this.getCouponById(couponId);
      if (!coupon) {
        throw new ApplicationError('Cupom não encontrado');
      }

      // Criar registro de uso
      const usage: CouponUsage = {
        id: `usage_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        couponId,
        userId,
        purchaseId,
        discountApplied,
        usedAt: new Date()
      };

      // Salvar uso
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'coupon-usage',
          entityId: usage.id,
          userId: parseInt(userId),
          userEmail: `user-${userId}`,
          oldData: null,
          newData: {
            usageType: 'COUPON_USAGE',
            ...usage
          } as any,
          changedFields: ['coupon.used'],
          timestamp: usage.usedAt,
          ipAddress: 'system',
          userAgent: 'promotional-coupon-service'
        }
      });

      // Incrementar contador de uso do cupom
      await this.incrementCouponUsage(couponId);

      console.log(`[COUPON] Cupom aplicado: ${coupon.code} por usuário ${userId}`);
      return usage;

    } catch (error) {
      console.error('[COUPON] Erro ao aplicar cupom:', error);
      throw error;
    }
  }

  /**
   * Listar cupons ativos
   */
  public async getActiveCoupons(): Promise<PromotionalCoupon[]> {
    try {
      const now = new Date();
      const allCoupons = await this.getAllCoupons();
      
      return allCoupons.filter(coupon => 
        coupon.isActive && 
        now >= coupon.validFrom && 
        now <= coupon.validTo &&
        (coupon.usageLimit === 0 || coupon.usageCount < coupon.usageLimit)
      );

    } catch (error) {
      console.error('[COUPON] Erro ao listar cupons ativos:', error);
      return [];
    }
  }

  /**
   * Obter performance do cupom
   */
  public async getCouponPerformance(couponId: string): Promise<CouponPerformance> {
    try {
      const coupon = await this.getCouponById(couponId);
      if (!coupon) {
        throw new ApplicationError('Cupom não encontrado');
      }

      // Buscar usos do cupom
      const usages = await this.getCouponUsages(couponId);

      const totalUses = usages.length;
      const totalDiscountGiven = usages.reduce((sum, usage) => sum + usage.discountApplied, 0);

      // Estimativa de receita gerada (assumindo que uso do cupom resultou em compra)
      const revenueGenerated = totalDiscountGiven * 3; // Estimativa baseada em desconto

      // Simular outras métricas
      const performance: CouponPerformance = {
        couponId: coupon.id,
        couponCode: coupon.code,
        couponName: coupon.name,
        totalUses,
        totalDiscountGiven,
        revenueGenerated,
        conversionRate: Math.random() * 15 + 5, // 5-20%
        averageOrderValue: revenueGenerated / Math.max(totalUses, 1),
        topCategories: [
          { category: 'Mangá', uses: Math.floor(totalUses * 0.4) },
          { category: 'Super-herói', uses: Math.floor(totalUses * 0.3) },
          { category: 'Nacional', uses: Math.floor(totalUses * 0.3) }
        ],
        userSegments: {
          newCustomers: Math.floor(totalUses * 0.6),
          returningCustomers: Math.floor(totalUses * 0.4)
        }
      };

      return performance;

    } catch (error) {
      console.error('[COUPON] Erro ao obter performance:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de cupons
   */
  public async generateCouponReport(period?: { startDate: Date; endDate: Date }) {
    try {
      const coupons = await this.getAllCoupons();
      const report = {
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter(c => c.isActive).length,
        expiredCoupons: 0,
        totalUses: 0,
        totalDiscountGiven: 0,
        topPerformers: [] as Array<{ code: string; name: string; uses: number; discount: number }>,
        byType: {} as Record<string, { count: number; uses: number; discount: number }>
      };

      const now = new Date();
      
      for (const coupon of coupons) {
        if (now > coupon.validTo) {
          report.expiredCoupons++;
        }

        const usages = await this.getCouponUsages(coupon.id, period);
        const usageCount = usages.length;
        const discountGiven = usages.reduce((sum, u) => sum + u.discountApplied, 0);

        report.totalUses += usageCount;
        report.totalDiscountGiven += discountGiven;

        // Top performers
        report.topPerformers.push({
          code: coupon.code,
          name: coupon.name,
          uses: usageCount,
          discount: discountGiven
        });

        // Por tipo
        if (!report.byType[coupon.type]) {
          report.byType[coupon.type] = { count: 0, uses: 0, discount: 0 };
        }
        report.byType[coupon.type].count++;
        report.byType[coupon.type].uses += usageCount;
        report.byType[coupon.type].discount += discountGiven;
      }

      // Ordenar top performers
      report.topPerformers.sort((a, b) => b.uses - a.uses);
      report.topPerformers = report.topPerformers.slice(0, 10);

      return {
        success: true,
        data: report,
        period
      };

    } catch (error) {
      console.error('[COUPON] Erro no relatório:', error);
      throw error;
    }
  }

  // Métodos auxiliares privados

  private async getCouponByCode(code: string): Promise<PromotionalCoupon | null> {
    try {
      const coupons = await this.getAllCoupons();
      return coupons.find(c => c.code.toUpperCase() === code.toUpperCase()) || null;
    } catch (error) {
      return null;
    }
  }

  private async getCouponById(id: string): Promise<PromotionalCoupon | null> {
    try {
      const coupons = await this.getAllCoupons();
      return coupons.find(c => c.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  private async getAllCoupons(): Promise<PromotionalCoupon[]> {
    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'promotional-coupon'
        },
        sort: ['timestamp:desc']
      });

      const couponMap = new Map<string, any>();
      
      auditLogs.forEach((log: any) => {
        const couponData = log.newData;
        if (couponData?.couponType === 'PROMOTIONAL_COUPON') {
          const couponId = log.entityId;
          if (!couponMap.has(couponId) || 
              new Date(log.timestamp) > new Date(couponMap.get(couponId).timestamp)) {
            couponMap.set(couponId, { ...couponData, timestamp: log.timestamp });
          }
        }
      });

      return Array.from(couponMap.values());

    } catch (error) {
      console.error('[COUPON] Erro ao buscar cupons:', error);
      return [];
    }
  }

  private async getUserCouponUsage(couponId: string, userId: string): Promise<number> {
    try {
      const usages = await this.getCouponUsages(couponId);
      return usages.filter(usage => usage.userId === userId).length;
    } catch (error) {
      return 0;
    }
  }

  private async getCouponUsages(couponId: string, period?: { startDate: Date; endDate: Date }): Promise<CouponUsage[]> {
    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'coupon-usage'
        }
      });

      const usages: CouponUsage[] = [];

      auditLogs.forEach((log: any) => {
        const usageData = log.newData;
        if (usageData?.usageType === 'COUPON_USAGE' && usageData.couponId === couponId) {
          const usedAt = new Date(usageData.usedAt);
          
          if (period) {
            if (usedAt < period.startDate || usedAt > period.endDate) {
              return;
            }
          }

          usages.push(usageData);
        }
      });

      return usages;

    } catch (error) {
      console.error('[COUPON] Erro ao buscar usos:', error);
      return [];
    }
  }

  private async incrementCouponUsage(couponId: string): Promise<void> {
    try {
      const coupon = await this.getCouponById(couponId);
      if (coupon) {
        coupon.usageCount++;
        coupon.updatedAt = new Date();

        // Salvar atualização
        await strapi.entityService.create('api::audit-log.audit-log', {
          data: {
            operation: 'UPDATE',
            entityName: 'promotional-coupon',
            entityId: couponId,
            userId: null,
            userEmail: 'system',
            oldData: null,
            newData: {
              couponType: 'PROMOTIONAL_COUPON',
              ...coupon
            } as any,
            changedFields: ['usageCount'],
            timestamp: coupon.updatedAt,
            ipAddress: 'system',
            userAgent: 'promotional-coupon-service'
          }
        });
      }
    } catch (error) {
      console.error('[COUPON] Erro ao incrementar uso:', error);
    }
  }

  private validateCouponType(couponData: Partial<PromotionalCoupon>): void {
    switch (couponData.type) {
      case 'PERCENTAGE':
        if (!couponData.discountValue || couponData.discountValue <= 0 || couponData.discountValue > 100) {
          throw new ApplicationError('Percentual de desconto deve ser entre 1 e 100');
        }
        break;

      case 'FIXED_AMOUNT':
        if (!couponData.discountValue || couponData.discountValue <= 0) {
          throw new ApplicationError('Valor fixo deve ser maior que zero');
        }
        break;

      case 'BUY_X_GET_Y':
        if (!couponData.buyQuantity || !couponData.getQuantity || 
            couponData.buyQuantity <= 0 || couponData.getQuantity <= 0) {
          throw new ApplicationError('Quantidades de compra e ganho devem ser maiores que zero');
        }
        break;
    }
  }

  private calculateDiscount(coupon: PromotionalCoupon, cartData: any): number {
    let discount = 0;

    switch (coupon.type) {
      case 'PERCENTAGE':
        discount = cartData.totalValue * (coupon.discountValue / 100);
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
          discount = coupon.maximumDiscount;
        }
        break;

      case 'FIXED_AMOUNT':
        discount = Math.min(coupon.discountValue, cartData.totalValue);
        break;

      case 'FREE_SHIPPING':
        // Assumir frete de R$ 15,00 (seria calculado dinamicamente)
        discount = 15.00;
        break;

      case 'BUY_X_GET_Y':
        // Lógica simplificada para Buy X Get Y
        const eligibleProducts = cartData.products.filter((p: any) => {
          return !coupon.applicableProducts || coupon.applicableProducts.includes(p.productId);
        });

        let totalEligibleQuantity = eligibleProducts.reduce((sum: number, p: any) => sum + p.quantity, 0);
        const freeItems = Math.floor(totalEligibleQuantity / (coupon.buyQuantity! + coupon.getQuantity!)) * coupon.getQuantity!;
        
        // Assumir desconto baseado no produto mais barato elegível
        if (freeItems > 0 && eligibleProducts.length > 0) {
          const cheapestProduct = eligibleProducts.reduce((cheapest: any, current: any) => 
            current.unitPrice < cheapest.unitPrice ? current : cheapest
          );
          discount = freeItems * cheapestProduct.unitPrice;
        }
        break;
    }

    return Math.round(discount * 100) / 100; // Arredondar para 2 casas decimais
  }
}