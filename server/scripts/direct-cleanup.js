const path = require('path');

// Configurar o Strapi para usar o banco diretamente
process.chdir(__dirname + '/..');
require('dotenv').config();

async function main() {
    console.log('🧹 LIMPEZA DIRETA DO BANCO DE DADOS');
    console.log('==================================');
    console.log('');

    try {
        // Importar e inicializar Strapi sem servidor HTTP
        const Strapi = require('@strapi/strapi');
        const app = Strapi({
            distDir: path.join(__dirname, '..', 'dist'),
        });
        await app.load();

        console.log('📊 Verificando dados atuais...');

        // Verificar dados atuais
        const currentData = {
            products: await app.db.query('api::product.product').count(),
            clients: await app.db.query('api::client.client').count(),
            addresses: await app.db.query('api::address.address').count(),
            cards: await app.db.query('api::card.card').count(),
            users: await app.db.query('plugin::users-permissions.user').count(),
            purchases: await app.db.query('api::purchase.purchase').count(),
            trades: await app.db.query('api::trade.trade').count(),
            coupons: await app.db.query('api::coupon.coupon').count(),
            cardOrders: await app.db.query('api::card-order.card-order').count(),
            chatConversations: await app.db.query('api::chat-conversation.chat-conversation').count(),
            chatMessages: await app.db.query('api::chat-message.chat-message').count(),
        };

        console.log('');
        console.log('📈 DADOS ATUAIS:');
        console.log('================');
        console.log('');
        console.log('✅ SERÃO PRESERVADOS:');
        console.log(`   📚 Produtos: ${currentData.products}`);
        console.log(`   👥 Clientes: ${currentData.clients}`);
        console.log(`   🏠 Endereços: ${currentData.addresses}`);
        console.log(`   💳 Cartões: ${currentData.cards}`);
        console.log(`   👤 Usuários: ${currentData.users}`);
        console.log('');
        console.log('❌ SERÃO REMOVIDOS:');
        console.log(`   🛒 Compras: ${currentData.purchases}`);
        console.log(`   🔄 Trocas: ${currentData.trades}`);
        console.log(`   🎫 Cupons: ${currentData.coupons}`);
        console.log(`   📦 Itens do carrinho: ${currentData.cardOrders}`);
        console.log(`   💬 Conversas: ${currentData.chatConversations}`);
        console.log(`   📨 Mensagens: ${currentData.chatMessages}`);

        const totalToRemove = currentData.purchases + currentData.trades + 
                             currentData.coupons + currentData.cardOrders + 
                             currentData.chatConversations + currentData.chatMessages;

        console.log('');
        console.log(`⚠️  TOTAL DE REGISTROS A SEREM REMOVIDOS: ${totalToRemove}`);
        console.log('');

        if (totalToRemove === 0) {
            console.log('🧹 O banco já está limpo!');
            await app.destroy();
            return;
        }

        // Executar limpeza
        console.log('🚀 Iniciando limpeza...');
        console.log('');

        // 1. Chat messages e conversations
        console.log('📱 Removendo mensagens e conversas do chat...');
        await app.db.query('api::chat-message.chat-message').deleteMany({});
        await app.db.query('api::chat-conversation.chat-conversation').deleteMany({});
        console.log('✅ Chat limpo');

        // 2. Trades (deve vir antes dos coupons)
        console.log('🔄 Removendo trocas...');
        await app.db.query('api::trade.trade').deleteMany({});
        console.log('✅ Trocas removidas');

        // 3. Coupons
        console.log('🎫 Removendo cupons...');
        await app.db.query('api::coupon.coupon').deleteMany({});
        console.log('✅ Cupons removidos');

        // 4. Purchases (deve vir antes dos card-orders)
        console.log('🛒 Removendo compras...');
        await app.db.query('api::purchase.purchase').deleteMany({});
        console.log('✅ Compras removidas');

        // 5. Card-orders
        console.log('📦 Removendo itens do carrinho...');
        await app.db.query('api::card-order.card-order').deleteMany({});
        console.log('✅ Carrinho limpo');

        // 6. Artigos e conteúdo
        console.log('📄 Removendo conteúdo adicional...');
        await app.db.query('api::article.article').deleteMany({});
        await app.db.query('api::about.about').deleteMany({});
        console.log('✅ Conteúdo removido');

        console.log('');
        console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
        console.log('');

        // Verificar resultados
        console.log('📊 Verificando resultados...');
        const finalData = {
            purchases: await app.db.query('api::purchase.purchase').count(),
            trades: await app.db.query('api::trade.trade').count(),
            coupons: await app.db.query('api::coupon.coupon').count(),
            cardOrders: await app.db.query('api::card-order.card-order').count(),
            chatConversations: await app.db.query('api::chat-conversation.chat-conversation').count(),
            chatMessages: await app.db.query('api::chat-message.chat-message').count(),
            
            // Dados preservados
            products: await app.db.query('api::product.product').count(),
            clients: await app.db.query('api::client.client').count(),
            addresses: await app.db.query('api::address.address').count(),
            cards: await app.db.query('api::card.card').count(),
            users: await app.db.query('plugin::users-permissions.user').count(),
        };

        console.log('');
        console.log('✅ DADOS PRESERVADOS:');
        console.log(`   📚 Produtos: ${finalData.products}`);
        console.log(`   👥 Clientes: ${finalData.clients}`);
        console.log(`   🏠 Endereços: ${finalData.addresses}`);
        console.log(`   💳 Cartões: ${finalData.cards}`);
        console.log(`   👤 Usuários: ${finalData.users}`);
        console.log('');
        console.log('🧹 DADOS REMOVIDOS (agora em 0):');
        console.log(`   🛒 Compras: ${finalData.purchases}`);
        console.log(`   🔄 Trocas: ${finalData.trades}`);
        console.log(`   🎫 Cupons: ${finalData.coupons}`);
        console.log(`   📦 Itens do carrinho: ${finalData.cardOrders}`);
        console.log(`   💬 Conversas: ${finalData.chatConversations}`);
        console.log(`   📨 Mensagens: ${finalData.chatMessages}`);

        console.log('');
        console.log('✨ Banco de dados limpo e pronto para uso!');

        await app.destroy();

    } catch (error) {
        console.error('');
        console.error('❌ ERRO DURANTE A LIMPEZA:');
        console.error('', error.message);
        console.error('');
        process.exit(1);
    }
}

main();