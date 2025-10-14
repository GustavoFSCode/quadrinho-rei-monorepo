import utils from '@strapi/utils';
const { ApplicationError } = utils.errors;
import { StockNotificationService } from './stockNotificationService';

export class CartService {

    private stockNotificationService: StockNotificationService;

    constructor() {
        this.stockNotificationService = new StockNotificationService();
    }

    public async createOrder(ctx: any) {
        try {
            const body = ctx.request.body;
            const me = ctx.state.user?.documentId;

            if (!me) {
                console.error('[CART] Token de usuário inválido');
                throw new ApplicationError('Token de autenticação inválido');
            }

            console.log('[CART] Iniciando criação de pedido no carrinho');

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
        });

        if (!user) {
            console.error(`[CART] Usuário não encontrado: ${me}`);
            throw new ApplicationError("Usuário não encontrado");
        }

        if (!user.client) {
            console.error(`[CART] Cliente não encontrado para usuário: ${me}`);
            throw new ApplicationError("Cliente não encontrado");
        }

        if (!user.client.cart) {
            console.error(`[CART] Carrinho não encontrado para cliente: ${user.client.documentId}`);
            throw new ApplicationError("Carrinho não encontrado");
        }

        const product = await strapi.documents('api::product.product').findOne({
            documentId: body?.product
        })

        console.log('User Document ID:', me);
        console.log('Product ID:', body?.product);
        console.log('Cart Document ID:', user?.client?.cart.documentId);

        if (!product) {
            console.error(`[CART] Produto não encontrado: ${body?.product}`);
            throw new ApplicationError("Produto não encontrado");
        }

        // RN0031 - Validar estoque antes de adicionar ao carrinho
        console.log(`[CART] Validando estoque para produto ${product.title}, quantidade: ${body?.quantity || 1}`);
        
        const stockValidation = await this.stockNotificationService.validateCartProductStock(
            body?.product,
            body?.quantity || 1,
            user?.client?.documentId
        );

        // Verificar se produto pode ser adicionado
        if (stockValidation.status === 'OUT_OF_STOCK') {
            throw new ApplicationError(`Produto fora de estoque: ${stockValidation.message}`);
        }

        if (stockValidation.status === 'INSUFFICIENT') {
            throw new ApplicationError(`Estoque insuficiente: ${stockValidation.message}. Disponível: ${stockValidation.availableStock}`);
        }

        // Log de aviso para estoque baixo mas ainda permite adicionar
        if (stockValidation.status === 'LOW_STOCK') {
            console.warn(`[CART] ⚠️  ${stockValidation.message}`);
        } else {
            console.log(`[CART] ✅ Estoque validado: ${stockValidation.message}`);
        }

        if (!body?.quantity || body?.quantity < 1) {
            console.error(`[CART] Quantidade inválida: ${body?.quantity}`);
            throw new ApplicationError("Quantidade deve ser um número positivo");
        }
        
        // Validar se há estoque suficiente para o carrinho
        if (body.quantity > product.stock) {
            console.error(`[CART] Estoque insuficiente. Solicitado: ${body.quantity}, Disponível: ${product.stock}`);
            throw new ApplicationError(`Estoque insuficiente. Disponível: ${product.stock} unidades`);
        }

        const hasOrders = user.client.cart.cartOrders && user.client.cart.cartOrders.length > 0;
        const existingOrder = hasOrders ? user.client.cart.cartOrders.find(order => {
            if (!order.product) return false;
            if (order.product.documentId !== body.product) return false;
            
            // Só considerar orders que não estão associados a uma compra em processamento
            // ou que estão associados mas ainda em processamento
            if (order.purchase) {
                return order.purchase.purchaseStatus === 'EM_PROCESSAMENTO';
            }
            // Se não tem purchase, é um item livre no carrinho
            return true;
        }) : null;
        
        console.log(`[CART] Produto existente encontrado:`, existingOrder ? 'SIM' : 'NÃO');
        if (existingOrder) {
            console.log(`[CART] Order existente - ID: ${existingOrder.documentId}, Quantidade atual: ${existingOrder.quantity}`);
        }
        if (hasOrders && existingOrder) {
            const quantityVerify = existingOrder.quantity + body.quantity;

            if (quantityVerify > product.stock) {
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

            // Baixar estoque para reservar o produto no carrinho
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
                    cart: user.client.cart.documentId,
                    createdAt: new Date(),
                    publishedAt: new Date()
                }
            })
            console.log('[CART] Ordem criada com sucesso:', order.documentId);
            await strapi.documents('api::cart.cart').update({
                documentId: user.client.cart.documentId,
                data: {
                    cartOrders: {
                        connect: [{ documentId: order.documentId }]
                    },
                    updatedAt: new Date()
                }
            })

            // Baixar estoque para reservar o produto no carrinho
            await strapi.documents('api::product.product').update({
                documentId: product.documentId,
                data: {
                    stock: product.stock - body.quantity
                }
            })

            console.log('[CART] Carrinho atualizado com sucesso');
        }
        return {
            message: "Produto adicionado com sucesso ao carrinho!"
        }

        } catch (error) {
            console.error('[CART] Erro ao criar pedido:', error);
            console.error('[CART] Stack trace:', error.stack);
            
            // Se é um ApplicationError, relançar
            if (error instanceof ApplicationError) {
                throw error;
            }
            
            // Outros erros
            throw new ApplicationError(`Erro interno no carrinho: ${error.message}`);
        }
    }

    public async updateQuantityOrder(ctx: any) {
        try {
            const body = ctx.request.body;
            const me = ctx.state.user.documentId;

            console.log(`[CART] Atualizando quantidade - Order ID: ${body.order}, Nova quantidade: ${body.quantity}`);

            // Agora body.order contém o documentId do PRODUTO, não do cartOrder
            // Precisamos buscar o cartOrder pelo produto e usuário
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
                                            purchase: {}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!user?.client?.cart?.cartOrders) {
                throw new ApplicationError("Carrinho não encontrado");
            }

            // Buscar o cartOrder que corresponde ao produto
            const order = user.client.cart.cartOrders.find(cartOrder => {
                if (!cartOrder.product) return false;
                if (cartOrder.product.documentId !== body.order) return false;
                
                // Só considerar orders livres ou em processamento
                if (cartOrder.purchase) {
                    return cartOrder.purchase.purchaseStatus === 'EM_PROCESSAMENTO';
                }
                return true;
            });

            console.log(`[CART] Order encontrado:`, order ? 'SIM' : 'NÃO');

            if (!body?.order || !order) {
                console.error(`[CART] Pedido não encontrado - Product ID: ${body.order}`);
                throw new ApplicationError("Pedido não encontrado no carrinho");
            }

            const newQuantity = body.quantity;

            if (newQuantity < 1) throw new ApplicationError("Quantidade deve ser maior que zero");

            // Buscar TODOS os cartOrders do mesmo produto para consolidação
            const allProductOrders = user.client.cart.cartOrders.filter(cartOrder => {
                if (!cartOrder.product) return false;
                if (cartOrder.product.documentId !== body.order) return false;
                
                if (cartOrder.purchase) {
                    return cartOrder.purchase.purchaseStatus === 'EM_PROCESSAMENTO';
                }
                return true;
            });

            console.log(`[CART] Encontrados ${allProductOrders.length} orders para o produto`);

            // Calcular quantidade total atual
            const currentTotalQuantity = allProductOrders.reduce((sum, cartOrder) => sum + cartOrder.quantity, 0);
            const quantityDifference = newQuantity - currentTotalQuantity;
            
            console.log(`[CART] Quantidade atual total: ${currentTotalQuantity}, Nova: ${newQuantity}, Diferença: ${quantityDifference}`);

            const currentStock = order.product.stock;
            const newStock = currentStock - quantityDifference; // Se aumentar qty, diminui stock

            // Validar estoque se aumentando quantidade
            if (quantityDifference > 0 && newStock < 0) {
                throw new ApplicationError(`Estoque insuficiente. Disponível: ${currentStock} unidades`);
            }

            // Se há múltiplos orders, consolidar em um só
            if (allProductOrders.length > 1) {
                console.log(`[CART] Consolidando ${allProductOrders.length} orders em 1`);
                
                const mainOrder = allProductOrders[0];
                
                // Remover orders extras
                for (let i = 1; i < allProductOrders.length; i++) {
                    await strapi.documents('api::card-order.card-order').delete({
                        documentId: allProductOrders[i].documentId
                    });
                }
                
                // Atualizar order principal
                const cartUpdated = await strapi.documents('api::card-order.card-order').update({
                    documentId: mainOrder.documentId,
                    data: {
                        quantity: newQuantity,
                        totalValue: newQuantity * order.product.priceSell,
                        updatedAt: new Date()
                    }
                });
                
                console.log(`[CART] Orders consolidados e quantidade atualizada para ${newQuantity}`);
                
            } else {
                // Atualizar o único order
                const cartUpdated = await strapi.documents('api::card-order.card-order').update({
                    documentId: order.documentId,
                    data: {
                        quantity: newQuantity,
                        totalValue: newQuantity * order.product.priceSell,
                        updatedAt: new Date()
                    }
                });
                
                console.log(`[CART] Quantidade do order único atualizada para ${newQuantity}`);
            }

            // Ajustar estoque do produto
            await strapi.documents('api::product.product').update({
                documentId: order.product.documentId,
                data: {
                    stock: newStock
                }
            });

            console.log(`[CART] Estoque do produto atualizado para ${newStock}`);

            return {
                message: "Quantidade atualizada com sucesso!",
                data: {
                    productId: order.product.documentId,
                    newQuantity: newQuantity,
                    newStock: newStock
                }
            };

        } catch (error) {
            console.error('[CART] Erro ao atualizar quantidade:', error);
            if (error instanceof ApplicationError) {
                throw error;
            }
            throw new ApplicationError("Erro ao editar pedido");
        }
    }

    /**
     * RN0032 - Validar todo o carrinho automaticamente
     */
    public async validateCartStock(ctx: any) {
        try {
            const me = ctx.state.user.documentId;

            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: me,
                populate: {
                    client: true
                }
            });

            if (!user?.client) {
                throw new ApplicationError("Cliente não encontrado");
            }

            console.log(`[CART] Validando carrinho completo para cliente ${user.client.documentId}`);

            const validation = await this.stockNotificationService.validateFullCart(user.client.documentId);

            return {
                success: true,
                data: validation,
                message: `Carrinho validado: ${validation.summary.total} produtos analisados`
            };

        } catch (error) {
            console.error('[CART] Erro na validação do carrinho:', error);
            throw error;
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

        const cartOrders = user?.client?.cart?.cartOrders
            .filter((order) => {
                if (order?.purchase) {
                    return order?.purchase?.purchaseStatus === "EM_PROCESSAMENTO"
                }

                return true
            }) || [];

        // Consolidar produtos por documentId
        const consolidatedProducts = new Map();
        
        cartOrders.forEach((order) => {
            if (!order.product) return;
            
            const productId = order.product.documentId;
            
            if (consolidatedProducts.has(productId)) {
                // Se produto já existe, somar a quantidade
                const existing = consolidatedProducts.get(productId);
                existing.quantity += order.quantity;
                existing.totalValue += (order.product.priceSell * order.quantity);
            } else {
                // Novo produto
                consolidatedProducts.set(productId, {
                    documentId: productId, // Usar productId em vez do cartOrder.documentId
                    title: order.product.title,
                    price: order.product.priceSell,
                    stock: order.product.stock,
                    quantity: order.quantity,
                    totalValue: order.product.priceSell * order.quantity
                });
            }
        });

        const orders = Array.from(consolidatedProducts.values());

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
                        },
                        purchases: {
                            populate: {
                                coupons: true
                            }
                        }
                    }
                }
            }
        })

        if (!user || !user?.client) throw new ApplicationError("Erro ao encontrar usuário");

        if (!user?.client?.cart?.cartOrders || user.client.cart.cartOrders.length === 0) return "Carrinho limpo com sucesso!"

        // Remover cupons da compra em processamento
        const pendingPurchase = user?.client?.purchases?.find(
            (purchase) => purchase?.purchaseStatus === 'EM_PROCESSAMENTO'
        );

        if (pendingPurchase && pendingPurchase.coupons && pendingPurchase.coupons.length > 0) {
            console.log(`[CART] Removendo ${pendingPurchase.coupons.length} cupons da compra em processamento`);

            await strapi.documents('api::purchase.purchase').update({
                documentId: pendingPurchase.documentId,
                data: {
                    coupons: {
                        disconnect: pendingPurchase.coupons.map(coupon => ({ documentId: coupon.documentId }))
                    },
                    updatedAt: new Date()
                }
            });
        }

        for (const order of user.client.cart.cartOrders) {
            // Devolver estoque ao limpar carrinho
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
        try {
            const productId = ctx.params.orderId; // Agora é productId
            const me = ctx.state.user.documentId;

            console.log(`[CART] Removendo produto do carrinho - Product ID: ${productId}, User: ${me}`);

            if (!productId) {
                throw new ApplicationError("ID do produto é obrigatório");
            }

            // Buscar o usuário e seu carrinho
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
                                            purchase: {}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!user?.client?.cart?.cartOrders) {
                throw new ApplicationError("Carrinho não encontrado");
            }

            // Encontrar TODOS os cartOrders do produto
            const productOrders = user.client.cart.cartOrders.filter(cartOrder => {
                if (!cartOrder.product) return false;
                if (cartOrder.product.documentId !== productId) return false;
                
                // Só remover orders livres ou em processamento
                if (cartOrder.purchase) {
                    return cartOrder.purchase.purchaseStatus === 'EM_PROCESSAMENTO';
                }
                return true;
            });

            console.log(`[CART] Encontrados ${productOrders.length} orders para remover`);

            if (productOrders.length === 0) {
                throw new ApplicationError("Produto não encontrado no carrinho");
            }

            // Calcular quantidade total para devolver ao estoque
            const totalQuantityToReturn = productOrders.reduce((sum, order) => sum + order.quantity, 0);
            const product = productOrders[0].product;

            console.log(`[CART] Removendo produto "${product.title}" - Quantidade total: ${totalQuantityToReturn}`);

            // Remover todos os cartOrders do produto
            for (const order of productOrders) {
                await strapi.documents('api::card-order.card-order').delete({
                    documentId: order.documentId
                });
                console.log(`[CART] CartOrder ${order.documentId} removido`);
            }

            // Devolver estoque
            const currentStock = product.stock;
            const newStock = currentStock + totalQuantityToReturn;

            await strapi.documents('api::product.product').update({
                documentId: product.documentId,
                data: {
                    stock: newStock
                }
            });

            console.log(`[CART] Estoque devolvido - Antes: ${currentStock}, Depois: ${newStock}`);

            return {
                message: "Produto removido com sucesso do carrinho!",
                data: {
                    productId: product.documentId,
                    productTitle: product.title,
                    quantityRemoved: totalQuantityToReturn,
                    stockRestored: newStock,
                    ordersRemoved: productOrders.length
                }
            };

        } catch (error) {
            console.error('[CART] Erro ao remover produto:', error);
            if (error instanceof ApplicationError) {
                throw error;
            }
            throw new ApplicationError("Erro ao remover item do carrinho");
        }
    }

    /**
     * Método para consolidar produtos duplicados no carrinho
     */
    public async consolidateDuplicateProducts(ctx: any) {
        try {
            const me = ctx.state.user.documentId;

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
                                            purchase: {}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!user?.client?.cart?.cartOrders) {
                return { message: "Carrinho vazio ou não encontrado" };
            }

            const cartOrders = user.client.cart.cartOrders;
            console.log(`[CART] Iniciando consolidação de ${cartOrders.length} orders`);

            // Agrupar por produto
            const productGroups = new Map();
            
            cartOrders.forEach(order => {
                if (!order.product) return;
                
                const productId = order.product.documentId;
                
                // Só consolidar orders sem purchase ou com purchase em processamento
                if (order.purchase && order.purchase.purchaseStatus !== 'EM_PROCESSAMENTO') {
                    return;
                }
                
                if (!productGroups.has(productId)) {
                    productGroups.set(productId, []);
                }
                productGroups.get(productId).push(order);
            });

            let consolidated = 0;
            let removed = 0;

            // Processar cada grupo de produtos
            for (const [productId, orders] of productGroups.entries()) {
                if (orders.length <= 1) continue; // Não há duplicatas
                
                console.log(`[CART] Consolidando ${orders.length} orders do produto ${productId}`);
                
                // Manter o primeiro order e somar as quantidades
                const mainOrder = orders[0];
                let totalQuantity = mainOrder.quantity;
                
                // Somar quantidades dos orders duplicados
                for (let i = 1; i < orders.length; i++) {
                    totalQuantity += orders[i].quantity;
                    
                    // Remover order duplicado
                    await strapi.documents('api::card-order.card-order').delete({
                        documentId: orders[i].documentId
                    });
                    removed++;
                }
                
                // Atualizar o order principal com a quantidade total
                await strapi.documents('api::card-order.card-order').update({
                    documentId: mainOrder.documentId,
                    data: {
                        quantity: totalQuantity,
                        totalValue: mainOrder.product.priceSell * totalQuantity,
                        updatedAt: new Date()
                    }
                });
                consolidated++;
            }

            console.log(`[CART] Consolidação concluída: ${consolidated} produtos consolidados, ${removed} orders removidos`);
            
            return {
                message: "Carrinho consolidado com sucesso",
                consolidated: consolidated,
                removed: removed
            };

        } catch (error) {
            console.error('[CART] Erro na consolidação:', error);
            throw new ApplicationError("Erro ao consolidar carrinho");
        }
    }
}