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
                cartOrders: {
                    product: {
                        productCategories: (() => {
                            if (query.category) {
                                return { documentId: { $eq: query.category } }
                            }
                            return {}
                        })()
                    }
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

        const sales = purchases
            .map((purchase) => {
                return {
                    totalValue: purchase.cartOrders.reduce((acc, order) => acc + (order.quantity - order.quantityRefund), 0),
                    yearMonth: new Date(purchase.date).toISOString().slice(0, 7)
                }
            })
            .reduce((acc, curr) => {
                const existing = acc.find(item => item.yearMonth === curr.yearMonth);
                if (existing) {
                    existing.totalValue += curr.totalValue;
                } else {
                    acc.push(curr);
                }
                return acc;
            }, [])

        return sales;
    }
