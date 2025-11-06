export class DashboardService {
    public async getDashboard(ctx) {
        const query = ctx.request.query;

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

        // Estrutura: { yearMonth: { categoryName: totalValue } }
        const salesByMonthAndCategory = {};

        purchases.forEach((purchase) => {
            const yearMonth = new Date(purchase.date).toISOString().slice(0, 7);

            // Inicializar o mês se não existir
            if (!salesByMonthAndCategory[yearMonth]) {
                salesByMonthAndCategory[yearMonth] = {};
            }

            // Processar cada item do carrinho
            purchase.cartOrders.forEach((order) => {
                const quantity = order.quantity - order.quantityRefund;

                if (order.product && order.product.productCategories) {
                    // Para cada categoria do produto
                    order.product.productCategories.forEach((category) => {
                        const categoryName = category.name;
                        const categoryId = category.documentId;

                        // Se houver filtro de categoria, aplicar
                        if (query.category && categoryId !== query.category) {
                            return;
                        }

                        // Inicializar a categoria se não existir neste mês
                        if (!salesByMonthAndCategory[yearMonth][categoryName]) {
                            salesByMonthAndCategory[yearMonth][categoryName] = 0;
                        }

                        // Adicionar a quantidade vendida
                        salesByMonthAndCategory[yearMonth][categoryName] += quantity;
                    });
                }
            });
        });

        // Converter para array no formato esperado
        const sales = Object.entries(salesByMonthAndCategory).map(([yearMonth, categories]) => ({
            yearMonth,
            categories
        })).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

        return sales;
    }

    public async getProductCategories(ctx) {
        const categories = await strapi.documents('api::product-category.product-category').findMany({
            fields: ['name']
        })

        return categories
    }
}
