/**
 * Simple database cleanup script
 */

const bootstrap = async () => {
  console.log('🧹 LIMPEZA DO BANCO DE DADOS');
  console.log('============================');
  console.log('');

  try {
    console.log('📊 Verificando dados atuais...');

    // Get current data counts  
    const currentData = {
      products: await strapi.db.query('api::product.product').count(),
      clients: await strapi.db.query('api::client.client').count(),
      addresses: await strapi.db.query('api::address.address').count(),
      cards: await strapi.db.query('api::card.card').count(),
      users: await strapi.db.query('plugin::users-permissions.user').count(),
      purchases: await strapi.db.query('api::purchase.purchase').count(),
      trades: await strapi.db.query('api::trade.trade').count(),
      coupons: await strapi.db.query('api::coupon.coupon').count(),
      cardOrders: await strapi.db.query('api::card-order.card-order').count(),
    };

    // Try to get chat data (might not exist)
    try {
      currentData.chatConversations = await strapi.db.query('api::chat-conversation.chat-conversation').count();
      currentData.chatMessages = await strapi.db.query('api::chat-message.chat-message').count();
    } catch (error) {
      currentData.chatConversations = 0;
      currentData.chatMessages = 0;
    }

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
      return;
    }

    console.log('🚀 Iniciando limpeza...');
    console.log('');

    // Execute cleanup in correct order (relationships matter)

    // 1. Chat messages and conversations
    console.log('📱 Removendo mensagens e conversas do chat...');
    try {
      await strapi.db.query('api::chat-message.chat-message').deleteMany({});
      await strapi.db.query('api::chat-conversation.chat-conversation').deleteMany({});
      console.log('✅ Chat limpo');
    } catch (error) {
      console.log('⚠️  Chat não encontrado (normal se não existe)');
    }

    // 2. Trades (must come before coupons due to relationships)
    console.log('🔄 Removendo trocas...');
    await strapi.db.query('api::trade.trade').deleteMany({});
    console.log('✅ Trocas removidas');

    // 3. Coupons
    console.log('🎫 Removendo cupons...');
    await strapi.db.query('api::coupon.coupon').deleteMany({});
    console.log('✅ Cupons removidos');

    // 4. Purchases (must come before card-orders)
    console.log('🛒 Removendo compras...');
    await strapi.db.query('api::purchase.purchase').deleteMany({});
    console.log('✅ Compras removidas');

    // 5. Card-orders (cart items)
    console.log('📦 Removendo itens do carrinho...');
    await strapi.db.query('api::card-order.card-order').deleteMany({});
    console.log('✅ Carrinho limpo');

    // 6. Articles and additional content (if they exist)
    console.log('📄 Removendo conteúdo adicional...');
    try {
      await strapi.db.query('api::article.article').deleteMany({});
      await strapi.db.query('api::about.about').deleteMany({});
      console.log('✅ Conteúdo removido');
    } catch (error) {
      console.log('⚠️  Conteúdo adicional não encontrado (normal)');
    }

    console.log('');
    console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('');

    // Verify results
    console.log('📊 Verificando resultados...');
    const finalData = {
      purchases: await strapi.db.query('api::purchase.purchase').count(),
      trades: await strapi.db.query('api::trade.trade').count(),
      coupons: await strapi.db.query('api::coupon.coupon').count(),
      cardOrders: await strapi.db.query('api::card-order.card-order').count(),
      
      // Preserved data
      products: await strapi.db.query('api::product.product').count(),
      clients: await strapi.db.query('api::client.client').count(),
      addresses: await strapi.db.query('api::address.address').count(),
      cards: await strapi.db.query('api::card.card').count(),
      users: await strapi.db.query('plugin::users-permissions.user').count(),
    };

    // Try to get final chat counts
    try {
      finalData.chatConversations = await strapi.db.query('api::chat-conversation.chat-conversation').count();
      finalData.chatMessages = await strapi.db.query('api::chat-message.chat-message').count();
    } catch (error) {
      finalData.chatConversations = 0;
      finalData.chatMessages = 0;
    }

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

  } catch (error) {
    console.error('');
    console.error('❌ ERRO DURANTE A LIMPEZA:');
    console.error(error.message);
    console.error('');
    throw error;
  }
};

module.exports = bootstrap;