/**
 * Service de Gestão Avançada de Fornecedores - RNF0013
 * Sistema completo de gestão de fornecedores e relacionamentos
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface SupplierData {
  id: string;
  name: string;
  corporateName: string;
  cnpj?: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  rating: number; // 1-5 estrelas
  isActive: boolean;
  isPreferred: boolean;
  paymentTerms: string;
  leadTime: number; // dias
  minimumOrder?: number;
  categories: string[]; // categorias que fornece
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  onTimeDeliveryRate: number; // percentual
  qualityScore: number; // 1-5
  priceCompetitiveness: number; // 1-5
  overallRating: number;
  lastOrderDate?: Date;
  activeProducts: number;
  issues: Array<{
    type: 'delay' | 'quality' | 'price' | 'communication';
    date: Date;
    description: string;
    resolved: boolean;
  }>;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  orderNumber: string;
  products: Array<{
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalValue: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  attachments?: string[];
}

export class SupplierService {

  /**
   * RNF0013 - Criar novo fornecedor
   */
  public async createSupplier(supplierData: Omit<SupplierData, 'id' | 'createdAt' | 'updatedAt' | 'rating'>): Promise<SupplierData> {
    console.log(`[SUPPLIER] Criando fornecedor: ${supplierData.name}`);

    try {
      // Validações básicas
      if (!supplierData.name || !supplierData.email) {
        throw new ApplicationError('Nome e email são obrigatórios');
      }

      // Validar CNPJ se fornecido
      if (supplierData.cnpj && !this.validateCNPJ(supplierData.cnpj)) {
        throw new ApplicationError('CNPJ inválido');
      }

      // Verificar se já existe fornecedor com mesmo CNPJ ou email
      const existingSuppliers = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'supplier'
        }
      });

      const duplicateCheck = existingSuppliers.find((log: any) => {
        const data = log.newData;
        if (data?.supplierType === 'SUPPLIER') {
          return data.cnpj === supplierData.cnpj || data.email === supplierData.email;
        }
        return false;
      });

      if (duplicateCheck) {
        throw new ApplicationError('Fornecedor com este CNPJ ou email já existe');
      }

      // Criar fornecedor
      const supplier: SupplierData = {
        id: `supplier_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...supplierData,
        rating: 0, // Será calculado baseado em avaliações
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Salvar no sistema usando audit-log
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'supplier',
          entityId: supplier.id,
          userId: null,
          userEmail: 'system',
          oldData: null,
          newData: {
            supplierType: 'SUPPLIER',
            ...supplier
          } as any,
          changedFields: ['supplier.created'],
          timestamp: supplier.createdAt,
          ipAddress: 'system',
          userAgent: 'supplier-service'
        }
      });

      console.log(`[SUPPLIER] Fornecedor criado com sucesso: ${supplier.name} (${supplier.id})`);
      return supplier;

    } catch (error) {
      console.error('[SUPPLIER] Erro ao criar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Atualizar fornecedor
   */
  public async updateSupplier(
    supplierId: string,
    updateData: Partial<Omit<SupplierData, 'id' | 'createdAt'>>
  ): Promise<SupplierData> {

    if (!supplierId) {
      throw new ApplicationError('ID do fornecedor é obrigatório');
    }

    try {
      // Buscar fornecedor existente
      const existingSupplier = await this.getSupplierById(supplierId);
      if (!existingSupplier) {
        throw new ApplicationError('Fornecedor não encontrado');
      }

      // Validar CNPJ se alterado
      if (updateData.cnpj && updateData.cnpj !== existingSupplier.cnpj && !this.validateCNPJ(updateData.cnpj)) {
        throw new ApplicationError('CNPJ inválido');
      }

      // Preparar dados atualizados
      const updatedSupplier: SupplierData = {
        ...existingSupplier,
        ...updateData,
        updatedAt: new Date()
      };

      // Salvar atualização
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'UPDATE',
          entityName: 'supplier',
          entityId: supplierId,
          userId: null,
          userEmail: 'system',
          oldData: existingSupplier as any,
          newData: {
            supplierType: 'SUPPLIER',
            ...updatedSupplier
          } as any,
          changedFields: Object.keys(updateData),
          timestamp: updatedSupplier.updatedAt,
          ipAddress: 'system',
          userAgent: 'supplier-service'
        }
      });

      console.log(`[SUPPLIER] Fornecedor atualizado: ${updatedSupplier.name}`);
      return updatedSupplier;

    } catch (error) {
      console.error('[SUPPLIER] Erro ao atualizar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Buscar fornecedor por ID
   */
  public async getSupplierById(supplierId: string): Promise<SupplierData | null> {
    try {
      const suppliers = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'supplier',
          entityId: supplierId
        },
        sort: ['timestamp:desc'],
        limit: 1
      });

      if (suppliers.length === 0) {
        return null;
      }

      const latestSupplier = suppliers[0];
      const supplierData = latestSupplier.newData as any;

      if (supplierData?.supplierType === 'SUPPLIER') {
        return supplierData;
      }

      return null;

    } catch (error) {
      console.error('[SUPPLIER] Erro ao buscar fornecedor:', error);
      return null;
    }
  }

  /**
   * Listar todos os fornecedores
   */
  public async getAllSuppliers(filters: {
    isActive?: boolean;
    isPreferred?: boolean;
    category?: string;
    minRating?: number;
    search?: string;
    sortBy?: 'name' | 'rating' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}) {
    
    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'supplier'
        },
        sort: ['timestamp:desc']
      });

      // Agrupar por supplierId para pegar a versão mais recente
      const supplierMap = new Map<string, any>();
      
      auditLogs.forEach((log: any) => {
        const supplierData = log.newData;
        if (supplierData?.supplierType === 'SUPPLIER') {
          const supplierId = log.entityId;
          if (!supplierMap.has(supplierId) || 
              new Date(log.timestamp) > new Date(supplierMap.get(supplierId).timestamp)) {
            supplierMap.set(supplierId, { ...supplierData, timestamp: log.timestamp });
          }
        }
      });

      let suppliers = Array.from(supplierMap.values());

      // Aplicar filtros
      if (filters.isActive !== undefined) {
        suppliers = suppliers.filter(s => s.isActive === filters.isActive);
      }

      if (filters.isPreferred !== undefined) {
        suppliers = suppliers.filter(s => s.isPreferred === filters.isPreferred);
      }

      if (filters.category) {
        suppliers = suppliers.filter(s => 
          s.categories && s.categories.includes(filters.category)
        );
      }

      if (filters.minRating) {
        suppliers = suppliers.filter(s => s.rating >= filters.minRating);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        suppliers = suppliers.filter(s => 
          s.name.toLowerCase().includes(searchTerm) ||
          s.corporateName?.toLowerCase().includes(searchTerm) ||
          s.email.toLowerCase().includes(searchTerm)
        );
      }

      // Ordenação
      const sortBy = filters.sortBy || 'name';
      const sortOrder = filters.sortOrder || 'asc';
      
      suppliers.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          default:
            comparison = a.name.localeCompare(b.name);
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      // Paginação
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      const paginatedSuppliers = suppliers.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedSuppliers,
        pagination: {
          total: suppliers.length,
          offset,
          limit,
          hasMore: offset + limit < suppliers.length
        }
      };

    } catch (error) {
      console.error('[SUPPLIER] Erro ao listar fornecedores:', error);
      throw error;
    }
  }

  /**
   * Avaliar performance do fornecedor
   */
  public async evaluateSupplierPerformance(supplierId: string, period?: { startDate: Date; endDate: Date }): Promise<SupplierPerformance> {
    
    try {
      const supplier = await this.getSupplierById(supplierId);
      if (!supplier) {
        throw new ApplicationError('Fornecedor não encontrado');
      }

      // Buscar pedidos do fornecedor (simulado usando stock entries)
      let stockEntries = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'stock-entry'
        }
      });

      if (period) {
        stockEntries = stockEntries.filter((entry: any) => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= period.startDate && entryDate <= period.endDate;
        });
      }

      // Filtrar entradas relacionadas a este fornecedor
      const supplierEntries = stockEntries.filter((entry: any) => {
        const data = entry.newData;
        return data?.supplierName === supplier.name || 
               data?.supplierId === supplierId;
      });

      // Calcular métricas
      const totalOrders = supplierEntries.length;
      const totalValue = supplierEntries.reduce((sum: number, entry: any) => {
        const data = entry.newData;
        return sum + (data?.totalCost || 0);
      }, 0);

      const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

      // Simular métricas de qualidade (em produção viriam de avaliações reais)
      const onTimeDeliveryRate = Math.random() * 30 + 70; // 70-100%
      const qualityScore = Math.random() * 1.5 + 3.5; // 3.5-5
      const priceCompetitiveness = Math.random() * 1.5 + 3.5; // 3.5-5

      const overallRating = (onTimeDeliveryRate/20 + qualityScore + priceCompetitiveness) / 3;

      // Buscar último pedido
      const lastOrderDate = supplierEntries.length > 0 
        ? new Date(Math.max(...supplierEntries.map((e: any) => new Date(e.timestamp).getTime())))
        : undefined;

      // Contar produtos ativos (simulado)
      const activeProducts = Math.floor(Math.random() * 50) + 10;

      // Simular issues
      const issues = this.generateSupplierIssues(supplierId, supplierEntries.length);

      const performance: SupplierPerformance = {
        supplierId,
        supplierName: supplier.name,
        totalOrders,
        totalValue,
        averageOrderValue,
        onTimeDeliveryRate: Math.round(onTimeDeliveryRate),
        qualityScore: Math.round(qualityScore * 10) / 10,
        priceCompetitiveness: Math.round(priceCompetitiveness * 10) / 10,
        overallRating: Math.round(overallRating * 10) / 10,
        lastOrderDate,
        activeProducts,
        issues
      };

      return performance;

    } catch (error) {
      console.error('[SUPPLIER] Erro ao avaliar performance:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório comparativo de fornecedores
   */
  public async getSupplierComparison(supplierIds: string[], metrics: string[] = ['rating', 'price', 'delivery']) {
    
    try {
      const suppliers = await Promise.all(
        supplierIds.map(id => this.getSupplierById(id))
      );

      const validSuppliers = suppliers.filter(s => s !== null) as SupplierData[];
      
      if (validSuppliers.length < 2) {
        throw new ApplicationError('São necessários pelo menos 2 fornecedores válidos para comparação');
      }

      const performances = await Promise.all(
        validSuppliers.map(supplier => this.evaluateSupplierPerformance(supplier.id))
      );

      // Calcular rankings por métrica
      const comparison = validSuppliers.map((supplier, index) => {
        const performance = performances[index];
        
        return {
          supplier: {
            id: supplier.id,
            name: supplier.name,
            rating: supplier.rating,
            isPreferred: supplier.isPreferred
          },
          metrics: {
            overallRating: performance.overallRating,
            priceCompetitiveness: performance.priceCompetitiveness,
            onTimeDeliveryRate: performance.onTimeDeliveryRate,
            qualityScore: performance.qualityScore,
            totalOrders: performance.totalOrders,
            totalValue: performance.totalValue,
            activeProducts: performance.activeProducts,
            issueCount: performance.issues.length
          }
        };
      });

      // Calcular rankings
      const rankings = {
        byOverallRating: [...comparison].sort((a, b) => b.metrics.overallRating - a.metrics.overallRating),
        byPrice: [...comparison].sort((a, b) => b.metrics.priceCompetitiveness - a.metrics.priceCompetitiveness),
        byDelivery: [...comparison].sort((a, b) => b.metrics.onTimeDeliveryRate - a.metrics.onTimeDeliveryRate),
        byQuality: [...comparison].sort((a, b) => b.metrics.qualityScore - a.metrics.qualityScore),
        byVolume: [...comparison].sort((a, b) => b.metrics.totalValue - a.metrics.totalValue)
      };

      return {
        success: true,
        data: {
          suppliers: comparison,
          rankings,
          summary: {
            totalSuppliers: validSuppliers.length,
            bestOverall: rankings.byOverallRating[0].supplier,
            bestPrice: rankings.byPrice[0].supplier,
            bestDelivery: rankings.byDelivery[0].supplier,
            bestQuality: rankings.byQuality[0].supplier,
            highestVolume: rankings.byVolume[0].supplier
          }
        }
      };

    } catch (error) {
      console.error('[SUPPLIER] Erro na comparação:', error);
      throw error;
    }
  }

  /**
   * Criar pedido de compra
   */
  public async createPurchaseOrder(orderData: Omit<PurchaseOrder, 'id' | 'orderDate' | 'status'>): Promise<PurchaseOrder> {
    
    try {
      const supplier = await this.getSupplierById(orderData.supplierId);
      if (!supplier) {
        throw new ApplicationError('Fornecedor não encontrado');
      }

      const order: PurchaseOrder = {
        id: `po_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...orderData,
        status: 'PENDING',
        orderDate: new Date()
      };

      // Salvar pedido
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'purchase-order',
          entityId: order.id,
          userId: null,
          userEmail: 'system',
          oldData: null,
          newData: {
            orderType: 'PURCHASE_ORDER',
            ...order
          } as any,
          changedFields: ['purchase-order.created'],
          timestamp: order.orderDate,
          ipAddress: 'system',
          userAgent: 'supplier-service'
        }
      });

      console.log(`[SUPPLIER] Pedido criado: ${order.orderNumber} para ${supplier.name}`);
      return order;

    } catch (error) {
      console.error('[SUPPLIER] Erro ao criar pedido:', error);
      throw error;
    }
  }

  /**
   * Atualizar status do pedido
   */
  public async updatePurchaseOrderStatus(
    orderId: string, 
    status: PurchaseOrder['status'],
    notes?: string
  ) {
    try {
      const orders = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'purchase-order',
          entityId: orderId
        },
        sort: ['timestamp:desc'],
        limit: 1
      });

      if (orders.length === 0) {
        throw new ApplicationError('Pedido não encontrado');
      }

      const existingOrder = orders[0].newData as any;
      
      const updatedOrder = {
        ...existingOrder,
        status,
        notes: notes || existingOrder.notes,
        actualDeliveryDate: status === 'DELIVERED' ? new Date() : existingOrder.actualDeliveryDate
      };

      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'UPDATE',
          entityName: 'purchase-order',
          entityId: orderId,
          userId: null,
          userEmail: 'system',
          oldData: existingOrder,
          newData: {
            orderType: 'PURCHASE_ORDER',
            ...updatedOrder
          } as any,
          changedFields: ['status'],
          timestamp: new Date(),
          ipAddress: 'system',
          userAgent: 'supplier-service'
        }
      });

      console.log(`[SUPPLIER] Status do pedido ${orderId} atualizado para ${status}`);
      return { success: true, data: updatedOrder };

    } catch (error) {
      console.error('[SUPPLIER] Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de fornecedores
   */
  public async getSupplierStats() {
    try {
      const suppliers = await this.getAllSuppliers({ limit: 1000 });
      const allSuppliers = suppliers.data;

      const stats = {
        total: allSuppliers.length,
        active: allSuppliers.filter(s => s.isActive).length,
        preferred: allSuppliers.filter(s => s.isPreferred).length,
        averageRating: 0,
        byRating: {
          excellent: 0, // 4.5-5
          good: 0, // 3.5-4.5
          average: 0, // 2.5-3.5
          poor: 0 // <2.5
        },
        byCategory: {} as Record<string, number>,
        topPerformers: [] as Array<{ id: string; name: string; rating: number; }>
      };

      let totalRating = 0;
      let ratedSuppliers = 0;

      allSuppliers.forEach(supplier => {
        if (supplier.rating > 0) {
          totalRating += supplier.rating;
          ratedSuppliers++;

          if (supplier.rating >= 4.5) stats.byRating.excellent++;
          else if (supplier.rating >= 3.5) stats.byRating.good++;
          else if (supplier.rating >= 2.5) stats.byRating.average++;
          else stats.byRating.poor++;
        }

        // Contar por categoria
        if (supplier.categories) {
          supplier.categories.forEach(category => {
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
          });
        }
      });

      stats.averageRating = ratedSuppliers > 0 ? Math.round((totalRating / ratedSuppliers) * 10) / 10 : 0;

      // Top 5 performers
      stats.topPerformers = allSuppliers
        .filter(s => s.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          name: s.name,
          rating: s.rating
        }));

      return stats;

    } catch (error) {
      console.error('[SUPPLIER] Erro ao gerar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Validar CNPJ
   */
  private validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Validar dígitos verificadores
    let sum = 0;
    let weight = 5;
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cnpj[12]) !== digit1) return false;
    
    sum = 0;
    weight = 6;
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cnpj[13]) === digit2;
  }

  /**
   * Gerar issues simulados para fornecedor
   */
  private generateSupplierIssues(supplierId: string, orderCount: number) {
    const issues = [];
    const issueTypes = ['delay', 'quality', 'price', 'communication'] as const;
    
    // Gerar issues baseado no número de pedidos
    const issueCount = Math.floor(orderCount * 0.1); // 10% dos pedidos têm issues
    
    for (let i = 0; i < issueCount; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 90));
      
      issues.push({
        type: issueTypes[Math.floor(Math.random() * issueTypes.length)],
        date: randomDate,
        description: this.generateIssueDescription(),
        resolved: Math.random() > 0.3 // 70% dos issues são resolvidos
      });
    }
    
    return issues;
  }

  /**
   * Gerar descrição de issue simulada
   */
  private generateIssueDescription(): string {
    const descriptions = [
      'Atraso na entrega de 3 dias',
      'Produto recebido com defeito de qualidade',
      'Preço maior que o acordado',
      'Dificuldade de comunicação com vendedor',
      'Embalagem danificada no transporte',
      'Especificação diferente do pedido',
      'Documentação fiscal incorreta'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
}