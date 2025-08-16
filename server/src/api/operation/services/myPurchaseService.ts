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
                                cartOrders: {
                                    populate: {
                                        product: {
                                            fields: ['title']
                                        }
                                    }
                                },
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

    public async requestTrade(ctx) {
        const me = ctx.state.user.documentId;
        const body = ctx.request.body;

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        trades: {
                            populate: {
                                cartOrder: {}
                            }

                        }
                    }
                }
            }
        })

        const tradeStatus = await strapi.documents('api::trade-status.trade-status').findMany({
            filters: {
                name: { $eq: "Aberto" }
            }
        })

        const order = await strapi.documents('api::card-order.card-order').findOne({
            documentId: body.order,
            populate: {
                product: {},
                purchase: {}
            }
        })

        if (!order) throw new ApplicationError("Erro ao encontrar pedido");

        if (body?.quantity > (order?.quantity - order?.quantityRefund)) throw new ApplicationError("Quantidade não permitida para reembolso");

        try {

            const totalRefundValue = body?.quantity * order.product.priceSell

            await strapi.documents('api::trade.trade').create({
                data: {
                    cartOrder: body.order,
                    purchase: body.purchase,
                    totalValue: totalRefundValue,
                    quantity: body.quantity,
                    client: user.client.documentId,
                    tradeStatus: tradeStatus[0].documentId,
                    createdAt: new Date(),
                    publishedAt: new Date()
                }
            })

            await strapi.documents('api::card-order.card-order').update({
                documentId: order.documentId,
                data: {
                    quantityRefund: order.quantityRefund + (body.quantity | 0),
                    updatedAt: new Date(),
                }
            })

            return "Troca requisitada com sucesso!"
        } catch (e) {
            console.log(e);
            throw new ApplicationError("Erro ao requisitar troca");
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
                                cartOrder: {
                                    populate: {
                                        product: {
                                            fields: ['title']
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        })

        return user.client.trades
    }
}