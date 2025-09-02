/**
 * Testes E2E - Serviços Avançados
 * Cobre: Notificações, Rankings, Validações, Analytics, Cupons, Wishlist, Reviews
 * Issues: RNF0046, RN0027, RN0028, RN0031-32, Melhorias UX
 */

describe('Serviços Avançados E2E', () => {
  const testUser = {
    email: 'user@quadrinhoroi.com',
    password: 'User123456',
    name: 'João Silva'
  };

  const adminUser = {
    email: 'admin@quadrinhoroi.com',
    password: 'Admin123456'
  };

  beforeEach(() => {
    cy.task('db:seed');
  });

  afterEach(() => {
    cy.task('db:cleanup');
  });

  describe('Sistema de Notificações (RNF0046)', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('deve enviar notificação de confirmação de pedido', () => {
      // Realizar compra completa
      cy.completePurchaseFlow();
      
      // Verificar notificação automática
      cy.get('[data-cy="notifications-bell"]').click();
      cy.get('[data-cy="notification-panel"]').should('be.visible');
      
      cy.get('[data-cy="notification-item"]').first().should('contain', 'Pedido confirmado');
      cy.get('[data-cy="notification-timestamp"]').should('be.visible');
      cy.get('[data-cy="notification-unread-badge"]').should('exist');
    });

    it('deve notificar sobre mudanças de status de pedido', () => {
      // Criar pedido e simular mudança de status pelo admin
      cy.task('db:createPurchase', {
        userId: 'test-user-1',
        status: 'EM_PROCESSAMENTO'
      }).then((purchaseId) => {
        
        // Admin aprova o pedido
        cy.loginAsAdmin();
        cy.visit('/vendas');
        
        cy.get(`[data-cy="purchase-${purchaseId}"]`).within(() => {
          cy.get('[data-cy="approve-button"]').click();
        });
        
        // Volta para usuário e verifica notificação
        cy.login(testUser.email, testUser.password);
        cy.get('[data-cy="notifications-bell"]').click();
        
        cy.get('[data-cy="notification-item"]').should('contain', 'Pedido aprovado');
        cy.get('[data-cy="notification-priority"]').should('contain', 'MEDIUM');
      });
    });

    it('deve configurar preferências de notificação', () => {
      cy.visit('/perfil/notificacoes');
      
      // Configurar preferências
      cy.get('[data-cy="notification-email"]').uncheck();
      cy.get('[data-cy="notification-push"]').check();
      cy.get('[data-cy="notification-order-updates"]').check();
      cy.get('[data-cy="notification-promotions"]').uncheck();
      
      cy.get('[data-cy="save-preferences"]').click();
      cy.get('[data-cy="preferences-saved"]').should('be.visible');
      
      // Verificar que preferências foram salvas
      cy.reload();
      cy.get('[data-cy="notification-email"]').should('not.be.checked');
      cy.get('[data-cy="notification-push"]').should('be.checked');
    });

    it('deve marcar notificações como lidas', () => {
      // Criar algumas notificações
      cy.task('db:createNotifications', {
        userId: 'test-user-1',
        count: 3,
        type: 'order_update'
      });
      
      cy.visit('/');
      cy.get('[data-cy="notifications-count"]').should('contain', '3');
      
      // Marcar uma como lida
      cy.get('[data-cy="notifications-bell"]').click();
      cy.get('[data-cy="notification-item"]').first().within(() => {
        cy.get('[data-cy="mark-as-read"]').click();
      });
      
      // Verificar contagem atualizada
      cy.get('[data-cy="notifications-count"]').should('contain', '2');
      
      // Marcar todas como lidas
      cy.get('[data-cy="mark-all-as-read"]').click();
      cy.get('[data-cy="notifications-count"]').should('not.exist');
    });
  });

  describe('Sistema de Ranking de Clientes (RN0027)', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('deve calcular ranking baseado no histórico de compras', () => {
      // Criar histórico de compras para o cliente
      cy.task('db:createPurchaseHistory', {
        userId: 'test-user-1',
        purchases: [
          { value: 100.00, date: '2024-01-15', status: 'ENTREGUE' },
          { value: 150.50, date: '2024-02-20', status: 'ENTREGUE' },
          { value: 75.90, date: '2024-03-10', status: 'ENTREGUE' }
        ]
      });
      
      // Recalcular ranking
      cy.request({
        method: 'POST',
        url: '/api/operations/calculateClientRanking/test-user-1',
        headers: { 'Authorization': 'Bearer ' + Cypress.env('userToken') }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.newRanking).to.be.greaterThan(0);
        expect(response.body.tier).to.be.oneOf(['BRONZE', 'PRATA', 'OURO', 'DIAMANTE', 'VIP']);
      });
      
      // Verificar ranking no perfil
      cy.visit('/perfil');
      cy.get('[data-cy="client-ranking"]').should('be.visible');
      cy.get('[data-cy="ranking-tier"]').should('not.be.empty');
      cy.get('[data-cy="ranking-score"]').should('be.visible');
    });

    it('deve exibir benefícios baseados no tier', () => {
      // Configurar cliente com tier específico
      cy.task('db:setClientRanking', {
        clientId: 'test-user-1',
        ranking: 75,
        tier: 'OURO'
      });
      
      cy.visit('/perfil/beneficios');
      
      // Verificar benefícios do tier OURO
      cy.get('[data-cy="current-tier"]').should('contain', 'OURO');
      cy.get('[data-cy="benefit-discount"]').should('contain', '8% de desconto');
      cy.get('[data-cy="benefit-shipping"]').should('contain', 'Frete grátis');
      cy.get('[data-cy="benefit-early-access"]').should('contain', 'Acesso antecipado');
      
      // Verificar progresso para próximo tier
      cy.get('[data-cy="next-tier"]').should('contain', 'DIAMANTE');
      cy.get('[data-cy="ranking-progress"]').should('be.visible');
      cy.get('[data-cy="points-needed"]').should('contain', '11 pontos');
    });

    it('deve atualizar ranking automaticamente após compras', () => {
      const initialRanking = 45;
      cy.task('db:setClientRanking', {
        clientId: 'test-user-1',
        ranking: initialRanking
      });
      
      // Fazer uma compra grande
      cy.addProductToCart('expensive-product', 1); // Produto de R$ 200
      cy.completePurchaseFlow();
      
      // Aprovar compra (simulando admin)
      cy.loginAsAdmin();
      cy.approvePurchase('latest');
      
      // Verificar atualização do ranking
      cy.login(testUser.email, testUser.password);
      cy.visit('/perfil');
      
      cy.get('[data-cy="ranking-score"]').invoke('text').then((newRanking) => {
        expect(parseInt(newRanking)).to.be.greaterThan(initialRanking);
      });
    });

    it('deve permitir admin recalcular todos os rankings', () => {
      cy.loginAsAdmin();
      cy.visit('/clientes/rankings');
      
      cy.get('[data-cy="recalculate-all-rankings"]').click();
      cy.get('[data-cy="recalculation-progress"]').should('be.visible');
      
      // Verificar resultado
      cy.get('[data-cy="recalculation-complete"]').should('be.visible');
      cy.get('[data-cy="processed-count"]').should('be.visible');
      cy.get('[data-cy="updated-count"]').should('be.visible');
      
      // Verificar distribuição por tier
      cy.get('[data-cy="tier-distribution"]').should('be.visible');
      cy.get('[data-cy="bronze-count"]').should('be.visible');
      cy.get('[data-cy="prata-count"]').should('be.visible');
    });
  });

  describe('Sistema de Wishlist/Favoritos', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('deve adicionar produto à wishlist', () => {
      cy.visit('/estoque');
      
      // Buscar produto
      cy.get('[data-cy="product-search"]').type('Spider-Man');
      cy.get('[data-cy="search-button"]').click();
      
      // Adicionar à wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-wishlist"]').click();
      });
      
      // Verificar confirmação
      cy.get('[data-cy="wishlist-added-message"]').should('be.visible');
      cy.get('[data-cy="wishlist-count"]').should('contain', '1');
      
      // Verificar na página de wishlist
      cy.visit('/minha-wishlist');
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
      cy.get('[data-cy="wishlist-product-title"]').should('contain', 'Spider-Man');
    });

    it('deve notificar sobre mudanças de preço na wishlist', () => {
      // Adicionar produto à wishlist
      cy.task('db:addToWishlist', {
        userId: 'test-user-1',
        productId: 'test-product-1',
        notifyPriceChanges: true
      });
      
      // Simular mudança de preço pelo admin
      cy.loginAsAdmin();
      cy.visit('/estoque');
      cy.updateProductPrice('test-product-1', 25.90); // Preço anterior: 35.90
      
      // Verificar notificação ao usuário
      cy.login(testUser.email, testUser.password);
      cy.get('[data-cy="notifications-bell"]').click();
      
      cy.get('[data-cy="notification-item"]').should('contain', 'Produto da sua wishlist teve o preço reduzido');
      cy.get('[data-cy="price-drop-percentage"]').should('contain', '28% de desconto');
    });

    it('deve notificar sobre disponibilidade de produto em falta', () => {
      // Produto fora de estoque na wishlist
      cy.task('db:addToWishlist', {
        userId: 'test-user-1',
        productId: 'out-of-stock-product',
        notifyAvailability: true
      });
      
      // Admin reestoca produto
      cy.loginAsAdmin();
      cy.restockProduct('out-of-stock-product', 5);
      
      // Verificar notificação
      cy.login(testUser.email, testUser.password);
      cy.get('[data-cy="notifications-bell"]').click();
      
      cy.get('[data-cy="notification-item"]').should('contain', 'Produto da sua wishlist está disponível novamente');
    });

    it('deve gerenciar múltiplas wishlists', () => {
      cy.visit('/minha-wishlist');
      
      // Criar nova wishlist
      cy.get('[data-cy="create-wishlist"]').click();
      cy.get('[data-cy="wishlist-name"]').type('Quadrinhos Marvel');
      cy.get('[data-cy="wishlist-description"]').type('Coleção de quadrinhos da Marvel');
      cy.get('[data-cy="wishlist-private"]').check();
      cy.get('[data-cy="save-wishlist"]').click();
      
      // Adicionar produtos à wishlist específica
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type('Spider-Man');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="add-to-wishlist"]').click();
      cy.get('[data-cy="select-wishlist"]').select('Quadrinhos Marvel');
      cy.get('[data-cy="confirm-add-to-wishlist"]').click();
      
      // Verificar produto na wishlist correta
      cy.visit('/minha-wishlist');
      cy.get('[data-cy="wishlist-tab"]').contains('Quadrinhos Marvel').click();
      cy.get('[data-cy="wishlist-item"]').should('contain', 'Spider-Man');
    });
  });

  describe('Sistema de Reviews e Avaliações', () => {
    beforeEach(() => {
      // Criar compra entregue para permitir avaliação
      cy.task('db:createDeliveredPurchase', {
        userId: 'test-user-1',
        productId: 'test-product-1',
        productTitle: 'Batman Test Issue'
      });
      
      cy.login(testUser.email, testUser.password);
    });

    it('deve permitir avaliar produto comprado', () => {
      cy.visit('/minhas-compras');
      
      // Encontrar produto entregue e avaliar
      cy.get('[data-cy="delivered-purchase"]').first().within(() => {
        cy.get('[data-cy="review-product"]').click();
      });
      
      // Preencher avaliação
      cy.get('[data-cy="review-rating"]').click(); // 5 estrelas
      cy.get('[data-cy="review-title"]').type('Excelente quadrinho!');
      cy.get('[data-cy="review-comment"]').type('Historia incrível, arte fantástica. Recomendo muito!');
      
      // Upload de fotos (opcional) - comentado até configurar cypress-file-upload
      // cy.get('[data-cy="review-photos"]').attachFile(['review-photo1.jpg']);
      
      // Submeter avaliação
      cy.get('[data-cy="submit-review"]').click();
      
      // Verificar confirmação
      cy.get('[data-cy="review-success"]').should('contain', 'Avaliação enviada para moderação');
      
      // Verificar status pendente
      cy.visit('/minhas-avaliacoes');
      cy.get('[data-cy="review-status"]').should('contain', 'PENDENTE');
    });

    it('deve moderar avaliações (admin)', () => {
      // Criar avaliação pendente
      cy.task('db:createPendingReview', {
        userId: 'test-user-1',
        productId: 'test-product-1',
        rating: 5,
        title: 'Produto excelente',
        comment: 'Muito satisfeito com a compra'
      });
      
      cy.loginAsAdmin();
      cy.visit('/avaliacoes/moderar');
      
      // Revisar avaliação
      cy.get('[data-cy="pending-review"]').first().within(() => {
        cy.get('[data-cy="review-details"]').click();
      });
      
      // Aprovar avaliação
      cy.get('[data-cy="approve-review"]').click();
      cy.get('[data-cy="moderation-comment"]').type('Avaliação aprovada - conteúdo apropriado');
      cy.get('[data-cy="confirm-approval"]').click();
      
      // Verificar mudança de status
      cy.get('[data-cy="review-status"]').should('contain', 'APROVADA');
      
      // Verificar que aparece no produto
      cy.visit('/produtos/test-product-1');
      cy.get('[data-cy="product-reviews"]').should('be.visible');
      cy.get('[data-cy="review-rating"]').should('contain', '5');
      cy.get('[data-cy="review-title"]').should('contain', 'Produto excelente');
    });

    it('deve calcular estatísticas de avaliações', () => {
      // Criar múltiplas avaliações aprovadas
      cy.task('db:createMultipleReviews', {
        productId: 'test-product-1',
        reviews: [
          { rating: 5, title: 'Excelente' },
          { rating: 4, title: 'Muito bom' },
          { rating: 5, title: 'Perfeito' },
          { rating: 3, title: 'Regular' }
        ]
      });
      
      cy.visit('/produtos/test-product-1');
      
      // Verificar estatísticas
      cy.get('[data-cy="average-rating"]').should('contain', '4.3'); // (5+4+5+3)/4 = 4.25 ≈ 4.3
      cy.get('[data-cy="total-reviews"]').should('contain', '4 avaliações');
      
      // Verificar distribuição de estrelas
      cy.get('[data-cy="rating-distribution"]').should('be.visible');
      cy.get('[data-cy="stars-5-count"]').should('contain', '2');
      cy.get('[data-cy="stars-4-count"]').should('contain', '1');
      cy.get('[data-cy="stars-3-count"]').should('contain', '1');
      
      // Verificar filtros
      cy.get('[data-cy="filter-5-stars"]').click();
      cy.get('[data-cy="review-item"]').should('have.length', 2);
    });

    it('deve permitir marcar reviews como úteis', () => {
      cy.task('db:createApprovedReview', {
        reviewId: 'test-review-1',
        productId: 'test-product-1'
      });
      
      cy.visit('/produtos/test-product-1');
      
      // Marcar como útil
      cy.get('[data-cy="review-helpful"]').first().click();
      
      // Verificar contagem
      cy.get('[data-cy="helpful-count"]').should('contain', '1 pessoa achou útil');
      
      // Tentar marcar novamente (deve ser bloqueado)
      cy.get('[data-cy="review-helpful"]').first().click();
      cy.get('[data-cy="already-voted-message"]').should('be.visible');
    });
  });

  describe('Validações de Estoque no Carrinho (RN0031-32)', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('deve validar estoque automaticamente no carrinho', () => {
      // Adicionar produto ao carrinho
      cy.addProductToCart('test-product-1', 2);
      
      // Simular redução de estoque por outro usuário
      cy.task('db:updateProductStock', {
        productId: 'test-product-1',
        stock: 1
      });
      
      // Acessar carrinho e validar
      cy.visit('/carrinho');
      cy.get('[data-cy="validate-cart-stock"]').click();
      
      // Verificar ajuste automático
      cy.get('[data-cy="stock-validation-alert"]').should('be.visible');
      cy.get('[data-cy="adjusted-quantity-message"]').should('contain', 'Quantidade ajustada para 1');
      
      // Verificar que quantidade foi ajustada
      cy.get('[data-cy="cart-item-quantity"]').should('have.value', '1');
    });

    it('deve remover produtos sem estoque do carrinho', () => {
      cy.addProductToCart('test-product-1', 1);
      
      // Zerar estoque do produto
      cy.task('db:updateProductStock', {
        productId: 'test-product-1',
        stock: 0
      });
      
      cy.visit('/carrinho');
      cy.get('[data-cy="validate-cart-stock"]').click();
      
      // Verificar remoção automática
      cy.get('[data-cy="removed-items-alert"]').should('be.visible');
      cy.get('[data-cy="removed-product-name"]').should('contain', 'test-product-1');
      
      // Verificar carrinho vazio
      cy.get('[data-cy="cart-items"]').should('not.exist');
      cy.get('[data-cy="empty-cart-message"]').should('be.visible');
    });

    it('deve configurar thresholds de estoque', () => {
      cy.loginAsAdmin();
      cy.visit('/configuracoes/estoque');
      
      // Configurar limites
      cy.get('[data-cy="low-stock-threshold"]').clear().type('10');
      cy.get('[data-cy="critical-stock-threshold"]').clear().type('3');
      cy.get('[data-cy="out-of-stock-threshold"]').clear().type('0');
      
      cy.get('[data-cy="save-stock-config"]').click();
      cy.get('[data-cy="config-saved"]').should('be.visible');
      
      // Testar com produto de estoque baixo
      cy.task('db:updateProductStock', {
        productId: 'test-product-1',
        stock: 5
      });
      
      cy.login(testUser.email, testUser.password);
      cy.addProductToCart('test-product-1', 1);
      
      // Verificar alerta de estoque baixo
      cy.get('[data-cy="low-stock-warning"]').should('be.visible');
      cy.get('[data-cy="stock-warning-message"]').should('contain', 'Últimas unidades');
    });
  });

  describe('Sistema de Cupons Promocionais', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('deve criar e aplicar cupom promocional', () => {
      // Admin cria cupom
      cy.loginAsAdmin();
      cy.visit('/promocoes/cupons');
      
      cy.get('[data-cy="create-coupon"]').click();
      cy.get('[data-cy="coupon-code"]').type('DESCONTO20');
      cy.get('[data-cy="coupon-type"]').select('percentage');
      cy.get('[data-cy="coupon-value"]').type('20');
      cy.get('[data-cy="coupon-min-value"]').type('50');
      cy.get('[data-cy="coupon-expiry"]').type('2024-12-31');
      
      cy.get('[data-cy="save-coupon"]').click();
      
      // Usuário aplica cupom
      cy.login(testUser.email, testUser.password);
      cy.addProductToCart('test-product-1', 2); // Total > R$ 50
      cy.visit('/carrinho/realizar-compra');
      
      cy.get('[data-cy="coupon-code-input"]').type('DESCONTO20');
      cy.get('[data-cy="apply-coupon"]').click();
      
      // Verificar aplicação do desconto
      cy.get('[data-cy="coupon-applied"]').should('be.visible');
      cy.get('[data-cy="discount-amount"]').should('contain', '20%');
      cy.get('[data-cy="order-discount"]').should('be.visible');
    });

    it('deve validar regras de cupons', () => {
      cy.addProductToCart('test-product-1', 1); // Total < R$ 50
      cy.visit('/carrinho/realizar-compra');
      
      // Tentar aplicar cupom com valor mínimo não atingido
      cy.get('[data-cy="coupon-code-input"]').type('DESCONTO20');
      cy.get('[data-cy="apply-coupon"]').click();
      
      // Verificar erro de validação
      cy.get('[data-cy="coupon-error"]').should('contain', 'Valor mínimo não atingido');
      cy.get('[data-cy="min-value-required"]').should('contain', 'R$ 50,00');
    });

    it('deve otimizar uso de cupons para evitar troco', () => {
      cy.addProductToCart('test-product-1', 1); // R$ 35,90
      cy.visit('/carrinho/realizar-compra');
      
      // Aplicar cupom de valor fixo maior que o pedido
      cy.get('[data-cy="coupon-code-input"]').type('CUPOM50'); // R$ 50 de desconto
      cy.get('[data-cy="apply-coupon"]').click();
      
      // Verificar otimização automática
      cy.get('[data-cy="coupon-optimized"]').should('be.visible');
      cy.get('[data-cy="optimization-message"]').should('contain', 'Cupom otimizado para evitar troco');
      cy.get('[data-cy="final-total"]').should('contain', 'R$ 0,00');
    });
  });

  describe('Analytics e Relatórios Avançados', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.task('db:createAnalyticsData');
    });

    it('deve gerar gráfico de vendas por período', () => {
      cy.visit('/analytics/vendas');
      
      // Configurar período
      cy.get('[data-cy="period-start"]').type('2024-01-01');
      cy.get('[data-cy="period-end"]').type('2024-08-31');
      cy.get('[data-cy="group-by"]').select('month');
      
      cy.get('[data-cy="generate-chart"]').click();
      
      // Verificar gráfico gerado
      cy.get('[data-cy="sales-line-chart"]').should('be.visible');
      cy.get('[data-cy="chart-legend"]').should('be.visible');
      cy.get('[data-cy="chart-data-points"]').should('have.length.greaterThan', 0);
      
      // Verificar métricas resumo
      cy.get('[data-cy="total-sales"]').should('be.visible');
      cy.get('[data-cy="total-orders"]').should('be.visible');
      cy.get('[data-cy="average-ticket"]').should('be.visible');
    });

    it('deve mostrar top produtos vendidos', () => {
      cy.visit('/analytics/produtos');
      
      cy.get('[data-cy="top-products-period"]').select('last-30-days');
      cy.get('[data-cy="generate-report"]').click();
      
      // Verificar lista de top produtos
      cy.get('[data-cy="top-products-list"]').should('be.visible');
      cy.get('[data-cy="product-ranking"]').should('have.length', 10);
      
      // Verificar dados do primeiro produto
      cy.get('[data-cy="product-ranking"]').first().within(() => {
        cy.get('[data-cy="product-name"]').should('be.visible');
        cy.get('[data-cy="units-sold"]').should('be.visible');
        cy.get('[data-cy="revenue"]').should('be.visible');
        cy.get('[data-cy="growth-rate"]').should('be.visible');
      });
    });

    it('deve analisar funil de conversão', () => {
      cy.visit('/analytics/conversao');
      
      cy.get('[data-cy="conversion-period"]').select('last-month');
      cy.get('[data-cy="analyze-funnel"]').click();
      
      // Verificar etapas do funil
      cy.get('[data-cy="funnel-stage"]').should('have.length', 6);
      cy.get('[data-cy="stage-visitors"]').should('be.visible');
      cy.get('[data-cy="stage-cart-additions"]').should('be.visible');
      cy.get('[data-cy="stage-checkouts"]').should('be.visible');
      cy.get('[data-cy="stage-purchases"]').should('be.visible');
      
      // Verificar métricas de conversão
      cy.get('[data-cy="overall-conversion-rate"]').should('be.visible');
      cy.get('[data-cy="cart-abandonment-rate"]').should('be.visible');
      cy.get('[data-cy="average-cart-value"]').should('be.visible');
    });

    it('deve exportar relatórios em diferentes formatos', () => {
      cy.visit('/analytics/vendas');
      
      // Gerar relatório
      cy.get('[data-cy="period-start"]').type('2024-01-01');
      cy.get('[data-cy="period-end"]').type('2024-08-31');
      cy.get('[data-cy="generate-chart"]').click();
      
      // Exportar como CSV
      cy.get('[data-cy="export-csv"]').click();
      cy.get('[data-cy="download-success"]').should('be.visible');
      
      // Exportar como PDF
      cy.get('[data-cy="export-pdf"]').click();
      cy.get('[data-cy="pdf-generated"]').should('be.visible');
      
      // Agendar relatório automático
      cy.get('[data-cy="schedule-report"]').click();
      cy.get('[data-cy="schedule-frequency"]').select('monthly');
      cy.get('[data-cy="schedule-email"]').type('admin@quadrinhoroi.com');
      cy.get('[data-cy="save-schedule"]').click();
      
      cy.get('[data-cy="schedule-saved"]').should('be.visible');
    });
  });
});

