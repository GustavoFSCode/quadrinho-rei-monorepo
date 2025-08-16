// src/api/operation/services/databaseCleanupService.ts

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export class DatabaseCleanupService {
    
    public async cleanupDatabase(ctx) {
        try {
            console.log('🧹 Iniciando limpeza do banco de dados...');

            // 1. Limpar chat messages e conversations
            console.log('📱 Limpando mensagens e conversas do chat...');
            await strapi.db.query('api::chat-message.chat-message').deleteMany({});
            await strapi.db.query('api::chat-conversation.chat-conversation').deleteMany({});

            // 2. Limpar trades (trocas) - deve vir antes dos coupons pois tem relação
            console.log('🔄 Limpando trocas...');
            await strapi.db.query('api::trade.trade').deleteMany({});

            // 3. Limpar coupons
            console.log('🎫 Limpando cupons...');
            await strapi.db.query('api::coupon.coupon').deleteMany({});

            // 4. Limpar purchases (compras) - deve vir antes dos card-orders
            console.log('🛒 Limpando compras...');
            await strapi.db.query('api::purchase.purchase').deleteMany({});

            // 5. Limpar card-orders (itens do carrinho)
            console.log('📦 Limpando itens do carrinho...');
            await strapi.db.query('api::card-order.card-order').deleteMany({});

            // 6. Limpar carrinhos - limpar apenas os dados, mas manter os carrinhos vinculados aos clientes
            console.log('🛍️ Limpando carrinhos...');
            // Em vez de deletar os carrinhos, vamos apenas desconectar os card-orders
            // Os carrinhos devem permanecer para manter a relação com os clientes
            // Os card-orders já foram deletados acima, então os carrinhos já estão "limpos"

            // 7. Limpar artigos e conteúdo adicional (se existir)
            console.log('📄 Limpando artigos e conteúdo...');
            await strapi.db.query('api::article.article').deleteMany({});
            await strapi.db.query('api::about.about').deleteMany({});

            // NÃO deletar:
            // - products (quadrinhos) - MANTER
            // - clients - MANTER  
            // - addresses - MANTER (relacionados aos clientes)
            // - cards - MANTER (relacionados aos clientes)
            // - users - MANTER (relacionados aos clientes)
            // - product-categories - MANTER (relacionados aos produtos)
            // - precification-types - MANTER (relacionados aos produtos)
            // - authors - MANTER (relacionados aos produtos)
            // - categories - MANTER (relacionados aos produtos)
            // - purchase-sales-status - MANTER (dados de sistema)
            // - trade-status - MANTER (dados de sistema)

            console.log('✅ Limpeza do banco de dados concluída com sucesso!');
            console.log('📚 Produtos mantidos');
            console.log('👥 Clientes, endereços e cartões mantidos');
            console.log('⚙️ Dados de sistema mantidos');

            return {
                success: true,
                message: 'Banco de dados limpo com sucesso! Produtos, clientes, endereços e cartões foram preservados.',
                cleaned: [
                    'chat-messages',
                    'chat-conversations', 
                    'trades',
                    'coupons',
                    'purchases',
                    'card-orders',
                    'articles',
                    'about'
                ],
                preserved: [
                    'products',
                    'clients', 
                    'addresses',
                    'cards',
                    'users',
                    'product-categories',
                    'precification-types',
                    'authors',
                    'categories',
                    'purchase-sales-status',
                    'trade-status',
                    'carts'
                ]
            };

        } catch (error) {
            console.error('❌ Erro durante a limpeza do banco:', error);
            throw new ApplicationError('Erro ao limpar banco de dados: ' + error.message);
        }
    }

    public async getDataSummary(ctx) {
        try {
            const summary = {
                products: await strapi.db.query('api::product.product').count(),
                clients: await strapi.db.query('api::client.client').count(),
                addresses: await strapi.db.query('api::address.address').count(),
                cards: await strapi.db.query('api::card.card').count(),
                users: await strapi.db.query('plugin::users-permissions.user').count(),
                purchases: await strapi.db.query('api::purchase.purchase').count(),
                trades: await strapi.db.query('api::trade.trade').count(),
                coupons: await strapi.db.query('api::coupon.coupon').count(),
                cardOrders: await strapi.db.query('api::card-order.card-order').count(),
                chatConversations: await strapi.db.query('api::chat-conversation.chat-conversation').count(),
                chatMessages: await strapi.db.query('api::chat-message.chat-message').count(),
            };

            return summary;
        } catch (error) {
            console.error('❌ Erro ao obter resumo dos dados:', error);
            throw new ApplicationError('Erro ao obter resumo: ' + error.message);
        }
    }
}