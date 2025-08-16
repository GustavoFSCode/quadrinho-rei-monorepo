#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('📊 VERIFICANDO STATUS DO BANCO DE DADOS');
console.log('=======================================');
console.log('');

try {
  const curlCommand = `curl -X GET http://localhost:1337/api/getDataSummary \\
    -H "Content-Type: application/json" \\
    --silent --show-error --fail`;
  
  console.log('📡 Consultando dados do servidor...');
  const result = execSync(curlCommand, { encoding: 'utf8' });
  
  const data = JSON.parse(result);
  
  console.log('');
  console.log('📈 RESUMO ATUAL DO BANCO:');
  console.log('========================');
  console.log('');
  
  console.log('✅ DADOS QUE SERÃO PRESERVADOS:');
  console.log(`   📚 Produtos (quadrinhos): ${data.products}`);
  console.log(`   👥 Clientes: ${data.clients}`);
  console.log(`   🏠 Endereços: ${data.addresses}`);
  console.log(`   💳 Cartões: ${data.cards}`);
  console.log(`   👤 Usuários: ${data.users}`);
  console.log('');
  
  console.log('❌ DADOS QUE SERÃO REMOVIDOS:');
  console.log(`   🛒 Compras: ${data.purchases}`);
  console.log(`   🔄 Trocas: ${data.trades}`);
  console.log(`   🎫 Cupons: ${data.coupons}`);
  console.log(`   📦 Itens do carrinho: ${data.cardOrders}`);
  console.log(`   💬 Conversas do chat: ${data.chatConversations}`);
  console.log(`   📨 Mensagens do chat: ${data.chatMessages}`);
  console.log('');
  
  const totalToRemove = data.purchases + data.trades + data.coupons + 
                       data.cardOrders + data.chatConversations + data.chatMessages;
  
  if (totalToRemove > 0) {
    console.log(`⚠️  TOTAL DE REGISTROS QUE SERÃO REMOVIDOS: ${totalToRemove}`);
    console.log('');
    console.log('Para executar a limpeza, use:');
    console.log('   node scripts/cleanup-database.js');
  } else {
    console.log('🧹 O banco já está limpo!');
    console.log('Não há dados para remover.');
  }
  
} catch (error) {
  console.error('');
  console.error('❌ ERRO AO VERIFICAR STATUS:');
  console.error('');
  
  if (error.message.includes('Connection refused')) {
    console.error('🔗 O servidor Strapi não está rodando.');
    console.error('   Execute: yarn develop ou yarn start');
  } else if (error.message.includes('404')) {
    console.error('🔍 Endpoint não encontrado.');
    console.error('   Verifique se o servidor foi atualizado com as novas rotas.');
  } else {
    console.error('💥 Erro técnico:', error.message);
  }
  
  console.error('');
  process.exit(1);
}

console.log('');