import utils from '@strapi/utils';
const { ApplicationError } = utils.errors;

export class CartService {

    public async createOrder(ctx: any) {

        const body = ctx.request.body;
        const me = ctx.state.user.documentId

        console.log('A');

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {
                            populate: {
                                cartOrders: {
                                    populate: {
                                        product: {},
                                        purchase: {
                                            populate: {
                                                purchaseSalesStatus: {}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        console.log('B');

        const product = await strapi.documents('api::product.product').findOne({
            documentId: body?.product
        })

        console.log('C');

        console.log('User Document ID:', me);
        console.log('Product ID:', body?.product);
        console.log('Cart Document ID:', user?.client?.cart.documentId);

        if (!product) throw new ApplicationError("Erro ao encontrar produto")

        if (!body?.quantity || body?.quantity < 1) throw new ApplicationError("Quantidade inválida")

        const hasOrders = user?.client?.cart?.cartOrders.length > 0;
        const existingOrder = user?.client?.cart?.cartOrders.find(order => order.product.documentId === body.product && (() => {
            if (order?.purchase) {
                return order.purchase.purchaseStatus === 'Pendente'
            }

            return true
        })());
        if (hasOrders && existingOrder) {
            const quantityVerify = existingOrder.quantity + body.quantity;

            if (quantityVerify >= product.stock) {
                console.log(`Quantidade Verify: ${quantityVerify}, product.stock: ${product.stock}`)
                throw new ApplicationError("Quantidade acima do estoque, tente novamente");
            }

            await strapi.documents('api::card-order.card-order').update({
                documentId: existingOrder.documentId,
                data: {
                    quantity: quantityVerify,
                    totalValue: product.priceSell * quantityVerify,
                    updatedAt: new Date()
                }
            })

            await strapi.documents('api::product.product').update({
                documentId: product.documentId,
                data: {
                    stock: product.stock - body.quantity
                }
            })
        } else {
            const order = await strapi.documents('api::card-order.card-order').create({
                data: {
                    product: product.documentId,
                    quantity: body.quantity,
                    totalValue: product.priceSell * body.quantity,
                    cart: user?.client?.cart,
                    createdAt: new Date(),
                    publishedAt: new Date()
                }
            })
            console.log('D');
            await strapi.documents('api::cart.cart').update({
                documentId: user.client.cart.documentId,
                data: {
                    cartOrders: {
                        connect: [{ documentId: order.documentId }]
                    },
                    updatedAt: new Date()
                }
            })

            await strapi.documents('api::product.product').update({
                documentId: product.documentId,
                data: {
                    stock: product.stock - body.quantity
                }
            })

            console.log('E');
        }
        return {
            message: "Produto adicionado com sucesso ao carrinho!"
        }

    }

    public async updateQuantityOrder(ctx: any) {

        const body = ctx.request.body;

        const order = await strapi.documents('api::card-order.card-order').findOne({
            documentId: body.order,
            populate: {
                product: {}
            }
        })

        if (!body?.order || !order) throw new ApplicationError("Erro ao encontrar pedido")

        const currentStock = order.product.stock;
        const oldQuantity = order.quantity;
        const newQuantity = body.quantity;
        const stockDifference = oldQuantity - newQuantity;
        const newStock = currentStock + stockDifference;

        if (newQuantity < 1) throw new ApplicationError("Quantidade deve ser maior que zero");
        
        if (newQuantity > oldQuantity && newStock < 0) {
            throw new ApplicationError("Quantidade solicitada excede o estoque disponível");
        }

        try {

            const totalValue = newQuantity * order.product.priceSell

            const cartUpdated = await strapi.documents('api::card-order.card-order').update({
                documentId: order.documentId,
                data: {
                    quantity: newQuantity,
                    totalValue: totalValue
                }
            })

            await strapi.documents('api::product.product').update({
                documentId: order.product.documentId,
                data: {
                    stock: newStock
                }
            })

            return {
                data: cartUpdated,
                message: "Quantidade atualizada com sucesso!"
            }
        } catch (e) {
            console.log(e);
            throw new ApplicationError("Erro ao editar pedido");
        }
    }

    public async getOrders(ctx: any) {
        const me = ctx.state.user.documentId;
        const query = ctx.request.query;

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {
                            populate: {
                                cartOrders: {
                                    populate: {
                                        product: {},
                                        purchase: { populate: { purchaseSalesStatus: {} } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const orders = user?.client?.cart?.cartOrders
            .filter((order) => {
                if (order?.purchase) {
                    return order?.purchase?.purchaseStatus === "Pendente"
                }

                return true
            })
            .map((order) => {
                return {
                    documentId: order?.documentId,
                    title: order?.product.title,
                    price: order?.product.priceSell,
                    stock: order?.product.stock,
                    quantity: order?.quantity
                }
            }) || [];

        const totalValue = orders.reduce((acc, order) => acc + (order?.price * order?.quantity), 0);

        try {
            let paginatedOrders = orders;

            if (query.page && query.pageSize) {
                const page = parseInt(query.page, 10) || 1;
                const pageSize = parseInt(query.pageSize, 10) || 10;

                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;

                paginatedOrders = orders.slice(startIndex, endIndex);
            }

            return {
                data: {
                    totalValue: totalValue,
                    orders: paginatedOrders,
                    pagination: {
                        page: query.page || 1,
                        pageSize: query.pageSize || 10,
                        totalOrders: orders.length,
                        totalPages: Math.ceil(orders.length / (query.pageSize || 10)),
                    }
                }
            };
        } catch (e) {
            console.log(e);
            throw new ApplicationError("Erro ao listar carrinho");
        }
    }


    public async removeAllOrders(ctx: any) {
        const me = ctx.state.user.documentId

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {
                            populate: {
                                cartOrders: { 
                                    populate: { 
                                        purchase: {},
                                        product: {}
                                    } 
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!user || !user?.client) throw new ApplicationError("Erro ao encontrar usuário");

        if (!user?.client?.cart?.cartOrders || user.client.cart.cartOrders.length === 0) return "Carrinho limpo com sucesso!"

        for (const order of user.client.cart.cartOrders) {
            if (order.product) {
                await strapi.documents('api::product.product').update({
                    documentId: order.product.documentId,
                    data: {
                        stock: order.product.stock + order.quantity
                    }
                })
            }

            await strapi.documents('api::card-order.card-order').delete({
                documentId: order.documentId
            })
        }

        return "Carrinho limpo com sucesso!";
    }

    public async removeOrder(ctx: any) {
        const order = ctx.params.orderId

        if (!order) throw new ApplicationError("Erro ao encontrar pedido");

        try {

            const orderData = await strapi.documents('api::card-order.card-order').findOne({
                documentId: order,
                populate: {
                    product: {}
                }
            })

            if (orderData) {
                await strapi.documents('api::product.product').update({
                    documentId: orderData.product.documentId,
                    data: {
                        stock: orderData.product.stock + orderData.quantity
                    }
                })
            }

            await strapi.documents('api::card-order.card-order').delete({
                documentId: order
            })

            return "Pedido removido com sucesso do carrinho!"

        } catch (e) {
            console.log(e)
            throw new ApplicationError("Erro ao remover item do carrinho")
        }
    }
}