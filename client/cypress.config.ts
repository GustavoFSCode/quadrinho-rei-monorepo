import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Implementar tarefas do Cypress para testes E2E
      on('task', {
        // Tarefas de setup do banco de dados
        'db:seed'() {
          console.log('🌱 Seeding database...');
          // Para demonstração, retorna null (normalmente conectaria ao banco)
          return null;
        },
        
        'db:cleanup'() {
          console.log('🧹 Cleaning up database...');
          // Para demonstração, retorna null (normalmente limparia o banco)
          return null;
        },

        // Tarefas de criação de dados de teste
        'db:createDeliveredPurchase'(data) {
          console.log('📦 Creating delivered purchase:', data);
          return 'test-purchase-' + Date.now();
        },

        'db:createPurchase'(data) {
          console.log('💰 Creating purchase:', data);
          return 'test-purchase-' + Date.now();
        },

        'db:createOldDeliveredPurchase'(data) {
          console.log('📅 Creating old delivered purchase:', data);
          return 'test-purchase-old-' + Date.now();
        },

        'db:createApprovedPurchase'(data) {
          console.log('✅ Creating approved purchase:', data);
          return 'test-purchase-approved-' + Date.now();
        },

        'db:createTradeRequest'(data) {
          console.log('🔄 Creating trade request:', data);
          return 'test-trade-' + Date.now();
        },

        'db:createAuthorizedTrade'(data) {
          console.log('🔑 Creating authorized trade:', data);
          return 'test-trade-authorized-' + Date.now();
        },

        'db:createMultipleTrades'(trades) {
          console.log('📋 Creating multiple trades:', trades.length);
          return trades.map((_: any, i: number) => 'test-trade-' + i + '-' + Date.now());
        },

        'db:createTradeWithHistory'(data) {
          console.log('📈 Creating trade with history:', data);
          return 'test-trade-history-' + Date.now();
        },

        'db:createTradeTestData'() {
          console.log('🧪 Creating trade test data...');
          return { created: true };
        },

        // Tarefas de manipulação de estoque
        'db:updateProductStock'(data) {
          console.log('📦 Updating product stock:', data);
          return { success: true, productId: data.productId, stock: data.stock };
        },

        'db:createOldProduct'(data) {
          console.log('⏰ Creating old product:', data);
          return 'test-product-old-' + Date.now();
        },

        'db:createRecentProduct'(data) {
          console.log('🆕 Creating recent product:', data);
          return 'test-product-recent-' + Date.now();
        },

        'db:createLowStockProducts'() {
          console.log('⚠️ Creating low stock products...');
          return { created: 5 };
        },

        // Tarefas de notificações
        'db:getLatestNotification'(userId) {
          console.log('🔔 Getting latest notification for:', userId);
          return {
            templateKey: 'test_notification',
            templateData: { message: 'Test notification' },
            userId: userId,
            createdAt: new Date()
          };
        },

        'db:createNotifications'(data) {
          console.log('📢 Creating notifications:', data);
          return Array.from({ length: data.count }, (_, i) => ({
            id: 'notification-' + i,
            userId: data.userId,
            type: data.type
          }));
        },

        // Tarefas de ranking e clientes
        'db:getClientRanking'(clientId) {
          console.log('🏆 Getting client ranking for:', clientId);
          return Math.floor(Math.random() * 100) + 1;
        },

        'db:setClientRanking'(data) {
          console.log('🎯 Setting client ranking:', data);
          return { success: true, clientId: data.clientId, ranking: data.ranking };
        },

        'db:createPurchaseHistory'(data) {
          console.log('📊 Creating purchase history:', data);
          return { created: data.purchases.length };
        },

        // Tarefas de wishlist
        'db:addToWishlist'(data) {
          console.log('❤️ Adding to wishlist:', data);
          return 'wishlist-item-' + Date.now();
        },

        // Tarefas de reviews
        'db:createPendingReview'(data) {
          console.log('📝 Creating pending review:', data);
          return 'review-' + Date.now();
        },

        'db:createMultipleReviews'(data) {
          console.log('📚 Creating multiple reviews:', data.reviews.length);
          return data.reviews.map((_: any, i: number) => 'review-' + i + '-' + Date.now());
        },

        'db:createApprovedReview'(data) {
          console.log('✅ Creating approved review:', data);
          return 'review-approved-' + Date.now();
        },

        // Tarefas de cupons
        'db:getGeneratedCoupon'(tradeId) {
          console.log('🎫 Getting generated coupon for trade:', tradeId);
          return {
            id: 'coupon-' + tradeId,
            value: 29.90,
            type: 'TRADE',
            isActive: true,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 dias
          };
        },

        // Tarefas de analytics
        'db:createAnalyticsData'() {
          console.log('📈 Creating analytics data...');
          return { created: true };
        },

        // Log personalizado
        log(message) {
          console.log('🔍 Test Log:', message);
          return null;
        }
      });

      // Configurar variáveis de ambiente para testes
      config.env = {
        ...config.env,
        userToken: 'test-user-token',
        adminToken: 'test-admin-token'
      };

      return config;
    },
  },
  
  // Configuração para componentes (se necessário)
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});