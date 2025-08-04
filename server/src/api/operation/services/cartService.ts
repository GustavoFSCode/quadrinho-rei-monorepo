const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export class CartService {

    public async createOrder(ctx) {

        const body = ctx.request.body;
        const me = ctx.state.user.documentId

        console.log('A');

        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: me,
            populate: {
                client: {
                    populate: {
                        cart: {}
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

        try {
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
            const cartUpdate = await strapi.documents('api::cart.cart').update({
                documentId: user.client.cart.documentId,
                data: {
                    cartOrders: {
                        connect: [{ documentId: order.documentId }]
                    },
                    updatedAt: new Date()
                }
            })

            console.log('E');

            return {
                data: cartUpdate,
                message: "Produto adicionado com sucesso ao carrinho!"
            }

        } catch (e) {
            console.log(e);
            throw new ApplicationError("Erro ao criar pedido");
        }

    }

    public async updateQuantityOrder(ctx) {

        const body = ctx.request.body;
        const me = ctx.state.user.documentId

        const order = await strapi.documents('api::card-order.card-order').findOne({
            documentId: body.order,
            populate: {
                product: {}
            }
        })

        if (!body?.order || !order) throw new ApplicationError("Erro ao encontrar pedido")

        if (body?.quantity < 1 || body?.quantity > order.product.stock) throw new ApplicationError("Quantidade inválida");

        try {

            const totalValue = body.quantity * order.product.priceSell

            const cartUpdated = await strapi.documents('api::card-order.card-order').update({
                documentId: order.documentId,
                data: {
                    quantity: body.quantity,
                    totalValue: totalValue
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

    public async getOrders(ctx) {
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
                                        product: {}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const orders = user?.client?.cart?.cartOrders.map((order) => {
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


