export class DashboardService {
    // Helper function para calcular número da semana ISO 8601
    private getWeekNumber(date: Date): string {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }

    public async getDashboard(ctx) {
        const query = ctx.request.query;
        const periodType = query.periodType || 'daily'; // Default: daily

        const purchases = await strapi.documents('api::purchase.purchase').findMany({
            populate: {
                cartOrders: {
                    populate: {
                        product: {
                            populate: {
                                productCategories: {}
                            }
                        }
                    }
                },
                trade: {},
                purchaseSalesStatus: {}
            },
            filters: {
                purchaseSalesStatus: {
                    name: { $eq: "Entregue" }
                },
                date: (() => {
                    if (query.date1 && query.date2) {
                        return {
                            $gte: query.date1,
                            $lte: query.date2
                        }
                    }

                    return {}
                })()
            }
        })

        // Helper function para formatar data baseado no tipo de período
        const formatDateByPeriod = (dateValue: string | Date): string => {
            const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

            switch (periodType) {
                case 'daily':
                    return date.toISOString().slice(0, 10); // YYYY-MM-DD
                case 'weekly':
                    return this.getWeekNumber(date); // YYYY-WXX
                case 'monthly':
                    return date.toISOString().slice(0, 7); // YYYY-MM
                default:
                    return date.toISOString().slice(0, 10);
            }
        };

        // Estrutura: { period: { categoryName: totalValue } }
        const salesByPeriodAndCategory = {};

        purchases.forEach((purchase) => {
            const period = formatDateByPeriod(purchase.date);

            // Inicializar o período se não existir
            if (!salesByPeriodAndCategory[period]) {
                salesByPeriodAndCategory[period] = {};
            }

            // Processar cada item do carrinho
            purchase.cartOrders.forEach((order) => {
                const effectiveQuantity = order.quantity - order.quantityRefund;
                // Calcular valor efetivo após reembolsos
                const unitValue = order.totalValue / order.quantity; // Valor por unidade
                const totalValue = unitValue * effectiveQuantity; // Valor ajustado para reembolsos

                if (order.product && order.product.productCategories) {
                    // Para cada categoria do produto
                    order.product.productCategories.forEach((category) => {
                        const categoryName = category.name;
                        const categoryId = category.documentId;

                        // Se houver filtro de categoria, aplicar
                        if (query.category && categoryId !== query.category) {
                            return;
                        }

                        // Inicializar a categoria se não existir neste período
                        if (!salesByPeriodAndCategory[period][categoryName]) {
                            salesByPeriodAndCategory[period][categoryName] = 0;
                        }

                        // Adicionar o valor total vendido
                        salesByPeriodAndCategory[period][categoryName] += totalValue;
                    });
                }
            });
        });

        // Converter para array no formato esperado
        const sales = Object.entries(salesByPeriodAndCategory).map(([date, categories]) => ({
            date,
            categories
        })).sort((a, b) => a.date.localeCompare(b.date));

        return sales;
    }

    public async getProductCategories(ctx) {
        const categories = await strapi.documents('api::product-category.product-category').findMany({
            fields: ['name']
        })

        return categories
    }
}
