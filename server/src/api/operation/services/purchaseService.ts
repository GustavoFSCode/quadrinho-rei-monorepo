const utils = require('@strapi/utils')
const { ApplicationError } = utils.errors;
import { getBrazilDate } from '../../../utils/dateUtils';
import { StockService } from './stockService';
import { PaymentValidationService } from './paymentValidationService';

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
                                cartOrders: {
                                    populate: {
                                        product: {
                                            fields: ['title']
                                        }
                                    }
                                },
                                coupons: {}
                            }
                        }
                    }
                }
            }
        })

        const pendentPurchase = user?.client?.purchases.filter((purchase) => purchase?.purchaseStatus === 'EM_PROCESSAMENTO')[0];

        const totalOriginal = pendentPurchase?.cartOrders?.reduce((acc, order) => acc + order.totalValue, 0) || 0;
        const totalCoupons = pendentPurchase?.coupons?.reduce((acc, coupon) => acc + coupon.price, 0) || 0;
        const totalFinal = totalOriginal - totalCoupons;

        return {
            coupons: pendentPurchase?.coupons,
            addresses: pendentPurchase?.addresses,
            cards: pendentPurchase?.cards,
            orders: pendentPurchase?.cartOrders,
            totalPrice: totalFinal,
            totalValue: totalOriginal,
            totalCoupons: totalCoupons
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

        const pendentPurchase = user?.client?.purchases.find(purchase => purchase?.purchaseStatus === 'EM_PROCESSAMENTO');

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
                    purchaseStatus: "EM_PROCESSAMENTO",
                    purchaseSalesStatus: purchaseSalesStatus[0].documentId,
                    createdAt: getBrazilDate(),
                    publishedAt: getBrazilDate()
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
                updatedAt: getBrazilDate(),
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

        const pendentPurchase = user?.client?.purchases.filter((purchase) => purchase?.purchaseStatus === 'EM_PROCESSAMENTO')[0];

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

        console.log('[PURCHASE] Inserindo cartões:', JSON.stringify(body.cards, null, 2));

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {
                            populate: { cartOrders: {} }
                        },
                        purchases: {
                            sort: 'updatedAt:desc'
                        }
                    }
                }
            }
        })

        if (!user) throw new ApplicationError("Erro ao encontrar usuário")

        const pendentPurchase = user?.client?.purchases.filter((purchase) => purchase?.purchaseStatus === 'EM_PROCESSAMENTO')[0];

        if (!pendentPurchase) {
            throw new ApplicationError("Nenhuma compra em processamento encontrada");
        }

        console.log('[PURCHASE] ID da compra para inserir cartões:', pendentPurchase.documentId);

        // Processar cartões com valores
        let cardsToConnect = [];
        let cardPaymentData = [];
        
        if (Array.isArray(body.cards)) {
            body.cards.forEach(card => {
                if (typeof card === 'string') {
                    // Formato antigo - apenas documentId
                    cardsToConnect.push(card);
                } else if (card.cardId && typeof card.value === 'number') {
                    // Novo formato - cartão com valor
                    cardsToConnect.push(card.cardId);
                    cardPaymentData.push({
                        cardId: card.cardId,
                        value: card.value
                    });
                } else if (card.documentId) {
                    // Formato de objeto com documentId
                    cardsToConnect.push(card.documentId);
                }
            });
        } else if (typeof body.cards === 'string') {
            // Cartão único como string
            cardsToConnect = [body.cards];
        } else if (body.cards.cardId) {
            // Cartão único com valor
            cardsToConnect = [body.cards.cardId];
            cardPaymentData.push({
                cardId: body.cards.cardId,
                value: body.cards.value
            });
        }
        
        console.log('[PURCHASE] Cartões para conectar:', cardsToConnect);
        console.log('[PURCHASE] Dados de pagamento:', cardPaymentData);

        const updatedPurchase = await strapi.documents('api::purchase.purchase').update({
            documentId: pendentPurchase.documentId,
            data: {
                cards: {
                    connect: cardsToConnect
                },
                // Armazenar dados de pagamento como metadata se necessário
                ...(cardPaymentData.length > 0 && { cardPaymentData: JSON.stringify(cardPaymentData) })
            }
        })

        console.log('[PURCHASE] Cartões conectados. Resultado:', JSON.stringify(updatedPurchase, null, 2));

        // Verificar se os cartões foram realmente conectados
        const purchaseCheck = await strapi.documents('api::purchase.purchase').findOne({
            documentId: pendentPurchase.documentId,
            populate: { cards: true }
        });
        
        console.log('[PURCHASE] Verificação pós-inserção:', JSON.stringify(purchaseCheck.cards, null, 2));

        return "Cartões inseridos com sucesso!"
    }

    public async insertAddresses(ctx) {
        const me = ctx.state.user.documentId
        const body = ctx.request.body

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        purchases: { 
                            populate: { addresses: {} },
                            sort: 'updatedAt:desc'
                        }
                    }
                }
            }
        })

        if (!user) throw new ApplicationError("Erro ao encontrar usuário")

        const pendentPurchase = user?.client?.purchases.filter((purchase) => purchase?.purchaseStatus === 'EM_PROCESSAMENTO')[0];

        await strapi.documents('api::purchase.purchase').update({
            documentId: pendentPurchase.documentId,
            data: {
                addresses: {
                    connect: [...body.addresses]
                }
            }
        })

        return "Endereços relacionados com sucesso!";
    }

    public async endPurchase(ctx) {
        const me = ctx.state.user.documentId

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {
                            populate: { cartOrders: {} }
                        },
                        purchases: {
                            sort: 'updatedAt:desc'
                        }
                    }
                }
            }
        })

        if (!user) throw new ApplicationError("Erro ao encontrar usuário")

        const pendentPurchase = user?.client?.purchases.filter((purchase) => purchase?.purchaseStatus === 'EM_PROCESSAMENTO')[0];
        
        if (!pendentPurchase) {
            throw new ApplicationError("Nenhuma compra em processamento encontrada");
        }

        console.log('[PURCHASE] ID da compra para finalizar:', pendentPurchase.documentId);

        // Buscar produtos da compra para validar estoque
        const purchaseWithProducts = await strapi.documents('api::purchase.purchase').findOne({
            documentId: pendentPurchase.documentId,
            populate: {
                cartOrders: {
                    populate: {
                        product: true
                    }
                }
            }
        });

        // Validar estoque antes de finalizar
        const stockService = new StockService();
        const validacaoEstoque = await stockService.validarEstoqueCarrinho(purchaseWithProducts.cartOrders);
        
        if (!validacaoEstoque.valido) {
            throw new ApplicationError("Erro de estoque: " + validacaoEstoque.erros.join('; '));
        }

        // RN0033-RN0036 - Validar pagamento (cupons e cartões)
        const paymentValidationService = new PaymentValidationService();
        const paymentValidation = await paymentValidationService.applyPaymentValidation(pendentPurchase.documentId);
        
        if (!paymentValidation.success) {
            throw new ApplicationError("Erro de validação de pagamento: " + paymentValidation.validation.errors.join('; '));
        }

        const paymentStatus = await strapi.documents('api::purchase-sales-status.purchase-sales-status').findMany({
            filters: {
                name: {
                    $eq: "Em processamento"
                }
            }
        })

        const purchaseUpdate = await strapi.documents('api::purchase.purchase').update({
            documentId: pendentPurchase.documentId,
            data: {
                purchaseStatus: "APROVADA",
                purchaseSalesStatus: paymentStatus[0].documentId,
                date: getBrazilDate()
            },
            populate: {
                client: {
                    fields: ['name', 'cpf', 'phone']
                },
                coupons: {},
                cartOrders: { populate: { product: {} } }
            }
        })

        // Produtos já tiveram estoque baixado ao serem adicionados no carrinho
        // Na finalização apenas limpamos o carrinho - estoque já está correto
        await strapi.documents('api::cart.cart').update({
            documentId: user.client.cart.documentId,
            data: {
                cartOrders: { set: [] }
            }
        })

        if (!purchaseUpdate?.coupons || purchaseUpdate.coupons.length === 0) {
            return {
                data: purchaseUpdate,
                message: "Pedido finalizado com sucesso!"
            }
        }

        for (const coupon of purchaseUpdate?.coupons) {
            await strapi.documents('api::coupon.coupon').update({
                documentId: coupon.documentId,
                data: {
                    couponStatus: "Usado",
                    updatedAt: getBrazilDate(),
                }
            })
        }

        return {
            data: purchaseUpdate,
            message: "Pedido finalizado com sucesso!"
        }
    }
}