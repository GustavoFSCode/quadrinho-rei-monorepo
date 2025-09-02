#!/usr/bin/env node

/**
 * Script de Inativação Automática de Produtos - RF0013
 * Pode ser executado via cron ou manualmente
 * 
 * Uso:
 * node scripts/auto-inactivate-products.js [options]
 * 
 * Options:
 * --dry-run              Simular execução sem alterar dados
 * --days=N               Dias sem vendas (padrão: 90)
 * --price=N              Preço mínimo (padrão: 10.00)
 * --include-with-stock   Incluir produtos com estoque > 0
 * --stats                Mostrar apenas estatísticas
 */

const strapi = require('@strapi/strapi');
const path = require('path');

// Parse argumentos da linha de comando
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  showStats: args.includes('--stats'),
  daysWithoutSales: parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1]) || 90,
  minPriceThreshold: parseFloat(args.find(arg => arg.startsWith('--price='))?.split('=')[1]) || 10.00,
  zeroStockOnly: !args.includes('--include-with-stock')
};

console.log('🔄 SCRIPT DE INATIVAÇÃO AUTOMÁTICA DE PRODUTOS');
console.log('==============================================');
console.log('Opções:', options);
console.log('');

async function main() {
  let strapiInstance;
  
  try {
    // Inicializar Strapi
    console.log('📦 Inicializando Strapi...');
    strapiInstance = await strapi.default({ 
      dir: path.resolve(__dirname, '..'),
      autoReload: false
    });
    
    console.log('✅ Strapi inicializado com sucesso');

    // Importar service dinamicamente após Strapi estar pronto
    const { ProductInactivationService } = await import('../src/api/operation/services/productInactivationService.js');
    const inactivationService = new ProductInactivationService();

    if (options.showStats) {
      // Mostrar apenas estatísticas
      console.log('📊 ESTATÍSTICAS DE PRODUTOS');
      console.log('===========================');
      
      const stats = await inactivationService.getInactivationStats();
      
      console.log(`Total de produtos: ${stats.totalProducts}`);
      console.log(`Produtos ativos: ${stats.activeProducts}`);
      console.log(`Produtos inativos: ${stats.inactiveProducts}`);
      console.log(`Produtos com estoque zero: ${stats.zeroStockProducts}`);
      console.log(`Produtos com preço baixo: ${stats.lowPriceProducts}`);
      console.log(`Candidatos à inativação: ${stats.inactivationCandidates}`);
      console.log('');
      console.log('Configuração atual:');
      console.log(`- Dias sem vendas: ${stats.config.daysWithoutSales}`);
      console.log(`- Preço mínimo: R$${stats.config.minPriceThreshold.toFixed(2)}`);
      console.log(`- Apenas estoque zero: ${stats.config.zeroStockOnly ? 'Sim' : 'Não'}`);
      
    } else {
      // Executar processo de inativação
      console.log('🎯 EXECUTANDO PROCESSO DE INATIVAÇÃO');
      console.log('===================================');
      
      const config = {
        daysWithoutSales: options.daysWithoutSales,
        minPriceThreshold: options.minPriceThreshold,
        zeroStockOnly: options.zeroStockOnly,
        dryRun: options.dryRun
      };
      
      const result = await inactivationService.inactivateProducts(config);
      
      console.log('');
      console.log('📋 RESULTADO:');
      console.log(`✅ ${result.message}`);
      console.log(`📊 Produtos processados: ${result.processed}`);
      console.log(`🔒 Produtos inativados: ${result.inactivated}`);
      
      if (result.results && result.results.length > 0) {
        console.log('');
        console.log('📝 DETALHES:');
        console.log('===========');
        
        result.results.forEach((item, index) => {
          const status = item.action === 'INACTIVATED' ? '🔒' : 
                        item.action === 'WOULD_INACTIVATE' ? '🔸' : '❌';
          
          console.log(`${status} ${index + 1}. ${item.title} (ID: ${item.productId})`);
          console.log(`   Motivo: ${item.reason}`);
          if (item.lastSaleDate) {
            console.log(`   Última venda: ${item.lastSaleDate.toLocaleDateString('pt-BR')} (${item.daysSinceLastSale} dias atrás)`);
          } else {
            console.log(`   Última venda: Nunca`);
          }
          console.log('');
        });
      }
      
      if (options.dryRun) {
        console.log('💡 DICA: Execute sem --dry-run para aplicar as alterações');
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
    
  } finally {
    if (strapiInstance) {
      console.log('🔚 Finalizando Strapi...');
      await strapiInstance.destroy();
    }
    
    console.log('✅ Script concluído');
    process.exit(0);
  }
}

// Executar script
main().catch(error => {
  console.error('💥 ERRO FATAL:', error);
  process.exit(1);
});