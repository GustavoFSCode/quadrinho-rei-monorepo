const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
import { getBrazilDate } from '../../../utils/dateUtils';
export class MyPurchase {
    public async getMyPurchases(ctx) {
        const me = ctx.state.user.documentId;
        const query = ctx.request.query;

        try {
            // Buscar cliente do usuário primeiro
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: me,
                populate: {
                    client: true
                }
            }) as any;

            if (!user || !user.client) {
                console.log('User or client not found:', { user: !!user, client: !!user?.client });
                return [];
            }

            // Buscar compras do cliente diretamente
            const purchases = await strapi.entityService.findMany('api::purchase.purchase', {
                filters: {
                    client: {
                        id: user.client.id
                    },
                    purchaseStatus: { 
                        $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']  // Buscar compras com status válidos
                    }
                },
                populate: {
                    cartOrders: {
                        populate: {
                            product: {
                                fields: ['title']
                            }
                        }
                    },
                    purchaseSalesStatus: {
                        fields: ['name']
                    }
                },
                sort: { createdAt: 'desc' }
            });

            console.log(`Found ${purchases.length} purchases for client ${user.client.documentId || user.client.id}`);
            
            const formattedPurchases = purchases.map((purchase: any) => {
                return {
                    id: purchase.id,
                    documentId: purchase.documentId,
                    date: purchase?.date,
                    purchaseStatus: purchase?.purchaseStatus,
                    status: purchase?.purchaseSalesStatus,
                    orders: purchase?.cartOrders ? purchase.cartOrders.map((order) => {
                        return {
                            ...order,
                            availableRefundQuantity: (order?.quantity || 0) - (order?.quantityRefund || 0)
                        }
                    }) : [],
                    canRefund: purchase?.purchaseSalesStatus?.name === "Entregue" ? true : false
                }
            });
            if (query.page && query.pageSize) {
                return {
                    data: {
                        purchases: formattedPurchases,
                        pagination: {
                            page: query.page || 1,
                            pageSize: query.pageSize || 10,
                            totalOrders: formattedPurchases.length,
                            totalPages: Math.ceil(formattedPurchases.length / (query.pageSize || 10)),
                        }
                    }
                };
            }

            return formattedPurchases;

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
                    createdAt: getBrazilDate(),
                    publishedAt: getBrazilDate()
                }
            })

            await strapi.documents('api::card-order.card-order').update({
                documentId: order.documentId,
                data: {
                    quantityRefund: order.quantityRefund + (body.quantity | 0),
                    updatedAt: getBrazilDate(),
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