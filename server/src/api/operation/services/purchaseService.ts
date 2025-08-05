const utils = require('@strapi/utils')
const { ApplicationError } = utils.errors;

export class PurchaseService {

    public async getPurchase(ctx) {
        const me = ctx.state.user.documentId

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        purchases: {
                            populate: {
                                cards: {},
                                addresses: {},
                                cartOrders: {},
                                coupons: {}
                            }
                        }
                    }
                }
            }
        })

        const pendentPurchase = user?.client?.purchases.filter(async (purchase) => purchase?.purchaseStatus === 'Pendente')[0];

        return {
            addresses: pendentPurchase?.addresses,
            cards: pendentPurchase?.cards,
            orders: pendentPurchase?.cartOrders,
            totalPrice: pendentPurchase?.totalValue
        }
    }

    public async createUpdatePurchase(ctx) {
        const me = ctx.state.user.documentId;

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {
                            populate: { cartOrders: {} }
                        },
                        purchases: {}
                    }
                }
            }
        });

        if (!user) throw new ApplicationError("Erro ao encontrar usuário");

        const totalValue = user?.client?.cart?.cartOrders.reduce((acc, order) => acc + order.totalValue, 0) || 0;

        const pendentPurchase = user?.client?.purchases.find(purchase => purchase?.purchaseStatus === 'Pendente');

        const purchaseSalesStatus = await strapi.documents('api::purchase-sales-status.purchase-sales-status').findMany({
            filters: {
                name: { $eq: "Em processamento" }
            }
        });

        console.log('A');

        if (!purchaseSalesStatus || purchaseSalesStatus.length === 0) {
            throw new ApplicationError("Não foi possível encontrar o status de compra 'Em processamento'");
        }

        console.log('B', purchaseSalesStatus);
        console.log(`DocumentId: ${purchaseSalesStatus[0].documentId}`);
        console.log(`cartorders: ${user?.client?.cart?.cartOrders.map((order) => order?.documentId)}`);

        if (!pendentPurchase) {
            const cartOrders = user?.client?.cart?.cartOrders.map((order) => {
                return {
                    documentId: order.documentId
                };
            }) || [];

            const purchase = await strapi.documents('api::purchase.purchase').create({
                data: {
                    client: user.client.documentId,
                    totalValue: totalValue,
                    cartOrders: {
                        connect: cartOrders.length > 0 ? cartOrders : []
                    },
                    purchaseStatus: "Pendente",
                    purchaseSalesStatus: purchaseSalesStatus[0].documentId,
                    createdAt: new Date(),
                    publishedAt: new Date()
                }
            });

            console.log('D');

            return {
                data: purchase,
                message: "Compra realizada"
            };
        }

        console.log('E');
        const purchaseUpdated = await strapi.documents('api::purchase.purchase').update({
            documentId: pendentPurchase.documentId,
            data: {
                totalValue: totalValue,
                cartOrders: {
                    connect: [...user?.client?.cart?.cartOrders.map((order) => order?.documentId)]
                },
                updatedAt: new Date(),
            }
        });

        console.log('F');

        return {
            data: purchaseUpdated,
            message: "Compra atualizada"
        };
    }


    public async insertCouponPurchase(ctx) {

        const me = ctx.state.user.documentId
        const body = ctx.request.body

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {
                            populate: { cartOrders: {} }
                        },
                        purchases: {}
                    }
                }
            }
        })

        const couponsFound = await strapi.documents('api::coupon.coupon').findMany({
            filters: {
                code: {
                    $eq: body.coupon
                }
            }
        })

        const coupon = couponsFound[0]

        if (!coupon) throw new ApplicationError("Cupom não encontrado")

        if (coupon.couponStatus === "EmUso" || coupon.couponStatus === "Usado") throw new ApplicationError("Este cupom não pode ser utilizado")

        if (!user) throw new ApplicationError("Erro ao encontrar usuário")

        const totalValue = user?.client?.cart?.cartOrders.reduce((acc, order) => acc + order.totalValue, 0) || 0

        const pendentPurchase = user?.client?.purchases.filter(async (purchase) => purchase?.purchaseStatus === 'Pendente')[0];

        if (!pendentPurchase) throw new ApplicationError("Erro ao encontrar compra");

        await strapi.documents('api::coupon.coupon').update({
            documentId: coupon.documentId,
            data: {
                couponStatus: "EmUso"
            }
        })

        await strapi.documents('api::purchase.purchase').update({
            documentId: pendentPurchase.documentId,
            data: {
                coupons: {
                    connect: [{ documentId: coupon.documentId }],
                },
                totalValue: totalValue - coupon.price > 0 ? totalValue - coupon.price : 0,
                updatedAt: new Date()
            }
        })

        return "Cupom utilizado com sucesso!"
    }

    public async insertCards(ctx) {
        const me = ctx.state.user.documentId
        const body = ctx.request.body

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {
                            populate: { cartOrders: {} }
                        },
                        purchases: {}
                    }
                }
            }
        })

        if (!user) throw new ApplicationError("Erro ao encontrar usuário")

        const pendentPurchase = user?.client?.purchases.filter(async (purchase) => purchase?.purchaseStatus === 'Pendente')[0];

        await strapi.documents('api::purchase.purchase').update({
            documentId: pendentPurchase.documentId,
            data: {
                cards: {
                    connect: [body.cards]
                }
            }
        })

        return "Cartões inseridos com sucesso!"
    }

