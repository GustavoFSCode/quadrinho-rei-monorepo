const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
export class MyPurchase {
    public async getMyPurchases(ctx) {
        const me = ctx.state.user.documentId;
        const query = ctx.request.query;

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        purchases: {
                            populate: {
                                cartOrders: {},
                                purchaseSalesStatus: {}
                            }
                        }
                    }
                }
            },
        })

        try {
            const purchases = user?.client?.purchases.map((purchase) => {
                return {
                    id: purchase.id,
                    documentId: purchase.documentId,
                    date: purchase?.date,
                    status: purchase?.purchaseSalesStatus,
                    orders: purchase?.cartOrders.map((order) => {
                        return {
                            ...order,
                            availableRefundQuantity: order?.quantity - order?.quantityRefund
                        }
                    }),
                    canRefund: purchase?.purchaseSalesStatus?.name === "Entregue" ? true : false

                }
            })
            if (query.page && query.pageSize) {
                return {
                    data: {
                        purchases: purchases,
                        pagination: {
                            page: query.page || 1,
                            pageSize: query.pageSize || 10,
                            totalOrders: purchases.length,
                            totalPages: Math.ceil(purchases.length / (query.pageSize || 10)),
                        }
                    }
                };
            }

            return purchases;

        } catch (e) {
            console.log(e);
            throw new ApplicationError("Erro ao encontrar as compras")
        }
    }

    public async getMyTrades(ctx) {
        const me = ctx.state.user.documentId;

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        trades: {
                            populate: {
                                coupon: {},
                                tradeStatus: {},
                                cartOrder: {}
                            }
                        }
                    }
                }
            },
        })

        return user.client.trades
    }
}