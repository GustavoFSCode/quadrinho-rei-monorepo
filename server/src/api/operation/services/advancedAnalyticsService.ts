/**
 * Service de Analytics Avançada - RNF0043
 * Fornece dados para gráficos interativos e análises de negócio
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface SalesData {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  topProducts: Array<{
    productId: string;
    title: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface ComparisonData {
  period: string;
  currentPeriod: SalesData;
  previousPeriod: SalesData;
  growth: {
    salesGrowth: number;
    ordersGrowth: number;
    ticketGrowth: number;
  };
}

export class AdvancedAnalyticsService {

  /**
   * RNF0043 - Dados para gráfico de linhas de vendas
   */
  public async getSalesLineChartData(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
    console.log(`[ANALYTICS] Gerando dados do gráfico de linhas: ${startDate.toISOString()} - ${endDate.toISOString()}`);

    try {
      // Buscar todas as compras aprovadas no período
      const purchases = await strapi.entityService.findMany('api::purchase.purchase', {
        filters: {
          purchaseStatus: {
            $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']
          },
          date: {
            $gte: startDate,
            $lte: endDate
          }
        },
        populate: {
          cartOrders: {
            populate: {
              product: {
                fields: ['title', 'author', 'publisher']
              }
            }
          }
        }
      });

      // Agrupar dados por período
      const groupedData = this.groupSalesByPeriod(purchases, groupBy);
      
      // Formatar para gráfico de linha
      const chartData = this.formatLineChartData(groupedData, startDate, endDate, groupBy);

      return {
        success: true,
        data: chartData,
        summary: {
          totalPeriods: chartData.length,
          totalSales: chartData.reduce((sum, item) => sum + item.totalSales, 0),
          totalOrders: chartData.reduce((sum, item) => sum + item.totalOrders, 0),
          averageTicket: chartData.reduce((sum, item) => sum + item.averageTicket, 0) / chartData.length
        }
      };

    } catch (error) {
      console.error('[ANALYTICS] Erro ao gerar gráfico de linhas:', error);
      throw error;
    }
  }

  /**
   * Dados comparativos entre períodos
   */
  public async getComparisonAnalytics(
    currentStart: Date, 
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date
  ): Promise<ComparisonData> {

    const [currentData, previousData] = await Promise.all([
      this.getSalesSummary(currentStart, currentEnd),
      this.getSalesSummary(previousStart, previousEnd)
    ]);

    const growth = {
      salesGrowth: this.calculateGrowthPercentage(previousData.totalSales, currentData.totalSales),
      ordersGrowth: this.calculateGrowthPercentage(previousData.totalOrders, currentData.totalOrders),
      ticketGrowth: this.calculateGrowthPercentage(previousData.averageTicket, currentData.averageTicket)
    };

    return {
      period: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
      currentPeriod: currentData,
      previousPeriod: previousData,
      growth
    };
  }

  /**
   * Top produtos por período com métricas
   */
  public async getTopProductsAnalytics(startDate: Date, endDate: Date, limit: number = 10) {
    try {
      const purchases = await strapi.entityService.findMany('api::purchase.purchase', {
        filters: {
          purchaseStatus: {
            $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']
          },
          date: {
            $gte: startDate,
            $lte: endDate
          }
        },
        populate: {
          cartOrders: {
            populate: {
              product: {
                fields: ['title', 'author', 'publisher', 'priceSell']
              }
            }
          }
        }
      });

      // Agrupar por produto
      const productStats: Record<string, {
        product: any;
        quantity: number;
        revenue: number;
        orders: number;
      }> = {};

      purchases.forEach((purchase: any) => {
        if (purchase.cartOrders) {
          purchase.cartOrders.forEach((order: any) => {
            if (order.product) {
              const productId = order.product.documentId;
              
              if (!productStats[productId]) {
                productStats[productId] = {
                  product: order.product,
                  quantity: 0,
                  revenue: 0,
                  orders: 0
                };
              }
              
              productStats[productId].quantity += order.quantity;
              productStats[productId].revenue += order.totalValue;
              productStats[productId].orders += 1;
            }
          });
        }
      });

      // Ordenar por receita e pegar o top
      const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
        .map(stat => ({
          productId: stat.product.documentId,
          title: stat.product.title,
          author: stat.product.author,
          publisher: stat.product.publisher,
          quantity: stat.quantity,
          revenue: stat.revenue,
          orders: stat.orders,
          averagePrice: stat.revenue / stat.quantity
        }));

      return {
        success: true,
        data: topProducts,
        period: { startDate, endDate },
        totalProducts: Object.keys(productStats).length
      };

    } catch (error) {
      console.error('[ANALYTICS] Erro ao buscar top produtos:', error);
      throw error;
    }
  }

  /**
   * Análise de categorias
   */
  public async getCategoryAnalytics(startDate: Date, endDate: Date) {
    try {
      const purchases = await strapi.entityService.findMany('api::purchase.purchase', {
        filters: {
          purchaseStatus: {
            $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']
          },
          date: {
            $gte: startDate,
            $lte: endDate
          }
        },
        populate: {
          cartOrders: {
            populate: {
              product: {
                populate: {
                  productCategories: {
                    fields: ['name']
                  }
                }
              }
            }
          }
        }
      });

      const categoryStats: Record<string, {
        name: string;
        quantity: number;
        revenue: number;
        products: Set<string>;
      }> = {};

      purchases.forEach((purchase: any) => {
        if (purchase.cartOrders) {
          purchase.cartOrders.forEach((order: any) => {
            if (order.product && order.product.productCategories) {
              order.product.productCategories.forEach((category: any) => {
                if (!categoryStats[category.documentId]) {
                  categoryStats[category.documentId] = {
                    name: category.name,
                    quantity: 0,
                    revenue: 0,
                    products: new Set()
                  };
                }
                
                categoryStats[category.documentId].quantity += order.quantity;
                categoryStats[category.documentId].revenue += order.totalValue;
                categoryStats[category.documentId].products.add(order.product.documentId);
              });
            }
          });
        }
      });

      const categoryAnalytics = Object.values(categoryStats)
        .map(stat => ({
          name: stat.name,
          quantity: stat.quantity,
          revenue: stat.revenue,
          uniqueProducts: stat.products.size,
          averageTicket: stat.revenue / stat.quantity
        }))
        .sort((a, b) => b.revenue - a.revenue);

      return {
        success: true,
        data: categoryAnalytics,
        period: { startDate, endDate }
      };

    } catch (error) {
      console.error('[ANALYTICS] Erro na análise de categorias:', error);
      throw error;
    }
  }

  /**
   * Métricas de conversão e funil
   */
  public async getConversionFunnelData(startDate: Date, endDate: Date) {
    try {
      // Buscar dados do funil de conversão
      const [
        totalProducts,
        totalClients,
        cartOrders,
        purchases,
        completedPurchases
      ] = await Promise.all([
        strapi.entityService.count('api::product.product', { 
          filters: { active: true } 
        }),
        strapi.entityService.count('api::client.client'),
        strapi.entityService.findMany('api::card-order.card-order', {
          filters: {
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        }),
        strapi.entityService.count('api::purchase.purchase', {
          filters: {
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        }),
        strapi.entityService.count('api::purchase.purchase', {
          filters: {
            purchaseStatus: {
              $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']
            },
            date: {
              $gte: startDate,
              $lte: endDate
            }
          }
        })
      ]);

      const totalCartValue = cartOrders.reduce((sum, order) => sum + (order.totalValue || 0), 0);
      const uniqueCartsCount = new Set(cartOrders.map(order => (order as any).cart)).size;

      const funnelData = [
        { stage: 'Produtos Ativos', count: totalProducts, percentage: 100 },
        { stage: 'Clientes Cadastrados', count: totalClients, percentage: (totalClients / totalProducts) * 100 },
        { stage: 'Itens no Carrinho', count: cartOrders.length, percentage: (cartOrders.length / totalClients) * 100 },
        { stage: 'Carrinhos Únicos', count: uniqueCartsCount, percentage: (uniqueCartsCount / totalClients) * 100 },
        { stage: 'Compras Iniciadas', count: purchases, percentage: (purchases / uniqueCartsCount) * 100 },
        { stage: 'Compras Finalizadas', count: completedPurchases, percentage: (completedPurchases / purchases) * 100 }
      ];

      return {
        success: true,
        data: funnelData,
        metrics: {
          conversionRate: (completedPurchases / uniqueCartsCount) * 100,
          abandonmentRate: ((uniqueCartsCount - purchases) / uniqueCartsCount) * 100,
          averageCartValue: totalCartValue / cartOrders.length,
          period: { startDate, endDate }
        }
      };

    } catch (error) {
      console.error('[ANALYTICS] Erro no funil de conversão:', error);
      throw error;
    }
  }

  /**
   * Agrupar vendas por período
   */
  private groupSalesByPeriod(purchases: any[], groupBy: 'day' | 'week' | 'month') {
    const grouped: Record<string, {
      totalSales: number;
      totalOrders: number;
      products: Record<string, { quantity: number; revenue: number; title: string }>
    }> = {};

    purchases.forEach(purchase => {
      const date = new Date(purchase.date);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = {
          totalSales: 0,
          totalOrders: 0,
          products: {}
        };
      }

      grouped[key].totalSales += purchase.totalValue || 0;
      grouped[key].totalOrders += 1;

      // Agrupar produtos
      if (purchase.cartOrders) {
        purchase.cartOrders.forEach((order: any) => {
          if (order.product) {
            const productId = order.product.documentId;
            if (!grouped[key].products[productId]) {
              grouped[key].products[productId] = {
                quantity: 0,
                revenue: 0,
                title: order.product.title
              };
            }
            grouped[key].products[productId].quantity += order.quantity;
            grouped[key].products[productId].revenue += order.totalValue;
          }
        });
      }
    });

    return grouped;
  }

  /**
   * Formatar dados para gráfico de linha
   */
  private formatLineChartData(groupedData: any, startDate: Date, endDate: Date, groupBy: string) {
    const data: SalesData[] = [];
    const keys = Object.keys(groupedData).sort();

    keys.forEach(key => {
      const period = groupedData[key];
      const topProducts = Object.entries(period.products)
        .map(([productId, data]: [string, any]) => ({
          productId,
          title: data.title,
          quantity: data.quantity,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      data.push({
        date: key,
        totalSales: period.totalSales,
        totalOrders: period.totalOrders,
        averageTicket: period.totalOrders > 0 ? period.totalSales / period.totalOrders : 0,
        topProducts
      });
    });

    return data;
  }

  /**
   * Resumo de vendas para um período
   */
  private async getSalesSummary(startDate: Date, endDate: Date): Promise<SalesData> {
    const purchases = await strapi.entityService.findMany('api::purchase.purchase', {
      filters: {
        purchaseStatus: {
          $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']
        },
        date: {
          $gte: startDate,
          $lte: endDate
        }
      },
      populate: {
        cartOrders: {
          populate: {
            product: {
              fields: ['title']
            }
          }
        }
      }
    });

    const totalSales = purchases.reduce((sum, p) => sum + (p.totalValue || 0), 0);
    const totalOrders = purchases.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      date: startDate.toISOString().split('T')[0],
      totalSales,
      totalOrders,
      averageTicket,
      topProducts: []
    };
  }

  /**
   * Calcular percentual de crescimento
   */
  private calculateGrowthPercentage(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}