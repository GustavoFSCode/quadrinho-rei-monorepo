#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🧹 SCRIPT DE LIMPEZA DO BANCO DE DADOS');
console.log('=====================================');
console.log('');
console.log('⚠️  ATENÇÃO: Este script irá limpar os seguintes dados:');
console.log('   ❌ Todas as compras (purchases)');
console.log('   ❌ Todas as trocas (trades)');
console.log('   ❌ Todos os cupons (coupons)');
console.log('   ❌ Todos os itens do carrinho (card-orders)');
console.log('   ❌ Todas as mensagens do chat (chat-messages)');
console.log('   ❌ Todas as conversas do chat (chat-conversations)');
console.log('   ❌ Todos os artigos e conteúdo adicional');
console.log('');
console.log('✅ Os seguintes dados serão PRESERVADOS:');
console.log('   📚 Produtos (quadrinhos)');
console.log('   👥 Clientes');
console.log('   🏠 Endereços dos clientes');
console.log('   💳 Cartões dos clientes');
console.log('   👤 Usuários');
console.log('   🛍️ Carrinhos vazios (para manter relação com clientes)');
console.log('   ⚙️ Dados de sistema (status, categorias, etc.)');
console.log('');

rl.question('Tem certeza que deseja continuar? Digite "CONFIRMAR" para prosseguir: ', (answer) => {
  if (answer === 'CONFIRMAR') {
    console.log('');
    console.log('🚀 Iniciando limpeza do banco de dados...');
    console.log('');
    
    try {
      // Fazer uma chamada HTTP para o endpoint de limpeza
      // Como estamos em um script, vamos usar curl
      const curlCommand = `curl -X POST http://localhost:1337/api/cleanupDatabase \\
        -H "Content-Type: application/json" \\
        --silent --show-error --fail`;
      
      console.log('📡 Enviando comando de limpeza para o servidor...');
      const result = execSync(curlCommand, { encoding: 'utf8' });
      
      const response = JSON.parse(result);
      
      if (response.success) {
        console.log('');
        console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
        console.log('');
        console.log('📊 Dados removidos:');
        response.cleaned.forEach(item => {
          console.log(`   ❌ ${item}`);
        });
        console.log('');
        console.log('📊 Dados preservados:');
        response.preserved.forEach(item => {
          console.log(`   ✅ ${item}`);
        });
        console.log('');
        console.log('✨ Banco de dados limpo e pronto para uso!');
      } else {
        console.error('❌ Erro na limpeza:', response.message || 'Erro desconhecido');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('');
      console.error('❌ ERRO AO EXECUTAR LIMPEZA:');
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
    
  } else {
    console.log('❌ Operação cancelada.');
    console.log('Nenhum dado foi modificado.');
  }
  
  rl.close();
});

// Instruções de uso
console.log('💡 ANTES DE EXECUTAR:');
console.log('   1. Certifique-se de que o servidor Strapi está rodando');
console.log('   2. Execute: cd server && yarn develop');
console.log('   3. Aguarde o servidor inicializar completamente');
console.log('');