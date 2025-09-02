/**
 * Testes E2E - Sistema de Trocas
 * Cobre: Solicitar troca, Autorizar, Gerar cupom, Reentrada de estoque
 * Issues: RF0040-RF0044, RF0054
 */

describe('Sistema de Trocas E2E', () => {
  const testUser = {
    email: 'user@quadrinhoroi.com',
    password: 'User123456'
  };

  const adminUser = {
    email: 'admin@quadrinhoroi.com',
    password: 'Admin123456'
  };

  const testProduct = {
    title: 'X-Men Test Edition',
    price: 45.90,
    stock: 15
  };

  let purchaseId: string;
  let tradeId: string;

  beforeEach(() => {
    cy.task('db:seed');
    
    // Criar compra entregue para permitir troca
    cy.task('db:createDeliveredPurchase', {
      userId: 'test-user-1',
      productTitle: testProduct.title,
      quantity: 1,
      price: testProduct.price
    }).then((id) => {
      purchaseId = id as string;
    });
  });

  afterEach(() => {
    cy.task('db:cleanup');
  });

  describe('Solicitar Troca', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('deve permitir solicitar troca de produto entregue (RF0040)', () => {
      cy.visit('/minhas-compras');
      
      // Localizar compra entregue
      cy.get('[data-cy="purchase-item"]').contains(testProduct.title).parent().within(() => {
        cy.get('[data-cy="purchase-status"]').should('contain', 'ENTREGUE');
        cy.get('[data-cy="request-trade-button"]').should('be.visible').click();
      });
      
      // Preencher formulário de solicitação de troca
      cy.get('[data-cy="trade-reason"]').select('Produto com defeito');
      cy.get('[data-cy="trade-description"]').type('Produto chegou com páginas rasgadas');
      
      // Upload de fotos (opcional) - comentado até configurar cypress-file-upload
      // cy.get('[data-cy="trade-photos"]').attachFile(['trade-photo-1.jpg', 'trade-photo-2.jpg']);
      
      // Selecionar tipo de troca
      cy.get('[data-cy="trade-type-exchange"]').click(); // Trocar por outro produto
      cy.get('[data-cy="desired-product"]').select('Batman Test Issue');
      
      // Confirmar solicitação
      cy.get('[data-cy="confirm-trade-request"]').click();
      
      // Verificar confirmação
      cy.get('[data-cy="trade-success-message"]').should('be.visible');
      cy.get('[data-cy="trade-id"]').should('be.visible').then(($el) => {
        tradeId = $el.text();
      });
      
      // Verificar status inicial
      cy.get('[data-cy="trade-status"]').should('contain', 'SOLICITADA');
      
      // Verificar redirecionamento
      cy.url().should('include', '/minhas-compras/minhas-trocas');
    });

    it('deve bloquear troca de produtos não entregues (RN0041)', () => {
      // Criar compra não entregue
      cy.task('db:createPurchase', {
        userId: 'test-user-1',
        productTitle: testProduct.title,
        status: 'APROVADA' // Não entregue ainda
      });

      cy.visit('/minhas-compras');
      
      cy.get('[data-cy="purchase-item"]').contains(testProduct.title).parent().within(() => {
        cy.get('[data-cy="purchase-status"]').should('contain', 'APROVADA');
        cy.get('[data-cy="request-trade-button"]').should('not.exist');
        cy.get('[data-cy="trade-blocked-message"]').should('contain', 'Troca disponível após entrega');
      });
    });

    it('deve validar prazo para solicitação de troca', () => {
      // Criar compra entregue há mais de 30 dias
      cy.task('db:createOldDeliveredPurchase', {
        userId: 'test-user-1',
        productTitle: testProduct.title,
        deliveryDate: '2024-01-01'
      });

      cy.visit('/minhas-compras');
      
      cy.get('[data-cy="purchase-item"]').contains(testProduct.title).parent().within(() => {
        cy.get('[data-cy="request-trade-button"]').should('not.exist');
        cy.get('[data-cy="trade-expired-message"]').should('contain', 'Prazo para troca expirado');
      });
    });

    it('deve permitir diferentes tipos de troca', () => {
      cy.visit('/minhas-compras');
      
      cy.get('[data-cy="request-trade-button"]').first().click();
      
      // Teste troca por dinheiro (cupom)
      cy.get('[data-cy="trade-type-refund"]').click();
      cy.get('[data-cy="trade-reason"]').select('Não gostei do produto');
      cy.get('[data-cy="trade-description"]').type('Produto não atendeu expectativas');
      
      cy.get('[data-cy="confirm-trade-request"]').click();
      cy.get('[data-cy="trade-success-message"]').should('be.visible');
      
      // Verificar tipo da troca
      cy.visit('/minhas-compras/minhas-trocas');
      cy.get('[data-cy="trade-type"]').first().should('contain', 'Devolução (Cupom)');
    });
  });

  describe('Processo de Autorização (Admin)', () => {
    beforeEach(() => {
      // Criar solicitação de troca pendente
      cy.task('db:createTradeRequest', {
        purchaseId,
        productTitle: testProduct.title,
        reason: 'Produto com defeito',
        status: 'SOLICITADA'
      }).then((id) => {
        tradeId = id as string;
      });

      cy.loginAsAdmin();
    });

    it('deve autorizar troca válida (RF0041)', () => {
      cy.visit('/trocas');
      
      // Localizar troca pendente
      cy.get('[data-cy="pending-trade"]').contains(tradeId).parent().within(() => {
        cy.get('[data-cy="trade-status"]').should('contain', 'SOLICITADA');
        cy.get('[data-cy="review-trade-button"]').click();
      });
      
      // Revisar detalhes da troca
      cy.get('[data-cy="trade-details-modal"]').should('be.visible');
      cy.get('[data-cy="trade-reason"]').should('be.visible');
      cy.get('[data-cy="trade-photos"]').should('exist');
      cy.get('[data-cy="original-product"]').should('contain', testProduct.title);
      
      // Aprovar troca
      cy.get('[data-cy="approve-trade-button"]').click();
      cy.get('[data-cy="approval-comment"]').type('Troca autorizada - produto realmente com defeito');
      cy.get('[data-cy="confirm-approval"]').click();
      
      // Verificar mudança de status
      cy.get('[data-cy="trade-status"]').should('contain', 'AUTORIZADA');
      cy.get('[data-cy="success-message"]').should('contain', 'Troca autorizada com sucesso');
      
      // Verificar que cliente foi notificado
      cy.task('db:getLatestNotification', 'test-user-1').then((notification: any) => {
        expect(notification.templateKey).to.eq('trade_authorized');
      });
    });

    it('deve rejeitar troca inválida', () => {
      cy.visit('/trocas');
      
      cy.get('[data-cy="pending-trade"]').first().within(() => {
        cy.get('[data-cy="review-trade-button"]').click();
      });
      
      // Rejeitar troca
      cy.get('[data-cy="reject-trade-button"]').click();
      cy.get('[data-cy="rejection-reason"]').select('Produto não apresenta defeito');
      cy.get('[data-cy="rejection-comment"]').type('Após análise, produto está em perfeitas condições');
      cy.get('[data-cy="confirm-rejection"]').click();
      
      // Verificar status
      cy.get('[data-cy="trade-status"]').should('contain', 'REJEITADA');
      
      // Verificar notificação ao cliente
      cy.task('db:getLatestNotification', 'test-user-1').then((notification: any) => {
        expect(notification.templateKey).to.eq('trade_rejected');
        expect(notification.templateData.reason).to.contain('não apresenta defeito');
      });
    });

    it('deve gerenciar fila de trocas por prioridade', () => {
      // Criar múltiplas trocas com diferentes prioridades
      cy.task('db:createMultipleTrades', [
        { reason: 'Produto com defeito', priority: 'ALTA', createdAt: '2024-08-20' },
        { reason: 'Mudei de ideia', priority: 'BAIXA', createdAt: '2024-08-19' },
        { reason: 'Produto errado', priority: 'MEDIA', createdAt: '2024-08-21' }
      ]);
      
      cy.visit('/trocas');
      
      // Verificar ordenação por prioridade e data
      cy.get('[data-cy="trade-priority"]').first().should('contain', 'ALTA');
      cy.get('[data-cy="trade-reason"]').first().should('contain', 'Produto com defeito');
      
      // Verificar filtros
      cy.get('[data-cy="filter-priority"]').select('ALTA');
      cy.get('[data-cy="apply-filters"]').click();
      
      cy.get('[data-cy="pending-trade"]').should('have.length', 1);
      cy.get('[data-cy="trade-priority"]').should('contain', 'ALTA');
    });
  });

  describe('Geração de Cupom de Troca', () => {
    beforeEach(() => {
      // Criar troca autorizada
      cy.task('db:createAuthorizedTrade', {
        purchaseId,
        productTitle: testProduct.title,
        tradeValue: testProduct.price
      }).then((id) => {
        tradeId = id as string;
      });

      cy.loginAsAdmin();
    });

    it('deve gerar cupom após confirmação de recebimento (RF0042)', () => {
      cy.visit('/trocas');
      
      // Confirmar recebimento do produto
      cy.get('[data-cy="authorized-trade"]').contains(tradeId).parent().within(() => {
        cy.get('[data-cy="confirm-receipt-button"]').click();
      });
      
      // Preencher detalhes do recebimento
      cy.get('[data-cy="receipt-condition"]').select('Produto conforme solicitação');
      cy.get('[data-cy="receipt-notes"]').type('Produto realmente apresentava defeito conforme relatado');
      cy.get('[data-cy="generate-coupon"]').check();
      
      // Confirmar recebimento
      cy.get('[data-cy="confirm-receipt"]').click();
      
      // Verificar geração do cupom
      cy.get('[data-cy="coupon-generated-message"]').should('be.visible');
      cy.get('[data-cy="coupon-code"]').should('be.visible');
      cy.get('[data-cy="coupon-value"]').should('contain', `R$ ${testProduct.price.toFixed(2).replace('.', ',')}`);
      
      // Verificar mudança de status
      cy.get('[data-cy="trade-status"]').should('contain', 'CONCLUÍDA');
      
      // Verificar cupom na base de dados
      cy.task('db:getGeneratedCoupon', tradeId).then((coupon: any) => {
        expect(coupon.value).to.eq(testProduct.price);
        expect(coupon.type).to.eq('TRADE');
        expect(coupon.isActive).to.be.true;
      });
    });

    it('deve notificar cliente sobre cupom gerado', () => {
      cy.visit('/trocas');
      
      cy.get('[data-cy="confirm-receipt-button"]').first().click();
      cy.get('[data-cy="generate-coupon"]').check();
      cy.get('[data-cy="confirm-receipt"]').click();
      
      // Verificar notificação enviada
      cy.task('db:getLatestNotification', 'test-user-1').then((notification: any) => {
        expect(notification.templateKey).to.eq('trade_coupon_generated');
        expect(notification.templateData).to.have.property('couponCode');
        expect(notification.templateData).to.have.property('couponValue');
      });
      
      // Verificar que cliente pode ver cupom
      cy.login(testUser.email, testUser.password);
      cy.visit('/meus-cupons');
      
      cy.get('[data-cy="trade-coupon"]').should('be.visible');
      cy.get('[data-cy="coupon-origin"]').should('contain', 'Troca');
      cy.get('[data-cy="coupon-status"]').should('contain', 'Ativo');
    });

    it('deve configurar validade do cupom de troca', () => {
      cy.visit('/trocas/configuracoes');
      
      // Configurar validade padrão dos cupons
      cy.get('[data-cy="coupon-validity-days"]').clear().type('90');
      cy.get('[data-cy="coupon-auto-generate"]').check();
      cy.get('[data-cy="save-trade-config"]').click();
      
      // Gerar troca e verificar validade
      cy.visit('/trocas');
      cy.get('[data-cy="confirm-receipt-button"]').first().click();
      cy.get('[data-cy="confirm-receipt"]').click();
      
      // Verificar data de validade do cupom
      const expectedExpiryDate = new Date();
      expectedExpiryDate.setDate(expectedExpiryDate.getDate() + 90);
      
      cy.task('db:getGeneratedCoupon', tradeId).then((coupon: any) => {
        const couponExpiry = new Date(coupon.expiresAt);
        expect(couponExpiry.toDateString()).to.eq(expectedExpiryDate.toDateString());
      });
    });
  });

  describe('Reentrada de Estoque', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      
      // Configurar produto com estoque conhecido
      cy.task('db:updateProductStock', { 
        productId: 'test-product-1', 
        stock: 10,
        title: testProduct.title 
      });
    });

    it('deve reentrar produto no estoque após troca confirmada (RF0054)', () => {
      const initialStock = 10;
      const tradeQuantity = 1;
      
      // Criar e confirmar troca
      cy.task('db:createAuthorizedTrade', {
        productId: 'test-product-1',
        quantity: tradeQuantity,
        status: 'RECEBIDA'
      });
      
      // Verificar reentrada automática
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type(testProduct.title);
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-stock"]').should('contain', `${initialStock + tradeQuantity} disponíveis`);
      
      // Verificar histórico de movimentação
      cy.get('[data-cy="stock-history-button"]').click();
      cy.get('[data-cy="stock-movement-type"]').first().should('contain', 'REENTRADA_TROCA');
      cy.get('[data-cy="stock-movement-quantity"]').first().should('contain', `+${tradeQuantity}`);
      cy.get('[data-cy="stock-movement-reference"]').first().should('contain', 'TROCA_');
    });

    it('deve validar condição do produto na reentrada', () => {
      cy.visit('/trocas');
      
      cy.get('[data-cy="authorized-trade"]').first().within(() => {
        cy.get('[data-cy="confirm-receipt-button"]').click();
      });
      
      // Avaliar condição do produto
      cy.get('[data-cy="product-condition"]').select('Usado - Bom estado');
      cy.get('[data-cy="restock-product"]').check();
      cy.get('[data-cy="adjust-price"]').check();
      cy.get('[data-cy="new-price-percentage"]').type('80'); // 80% do preço original
      
      cy.get('[data-cy="confirm-receipt"]').click();
      
      // Verificar que produto foi reestocado com preço ajustado
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type(testProduct.title);
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-price"]').should('contain', (testProduct.price * 0.8).toFixed(2));
      cy.get('[data-cy="product-condition"]').should('contain', 'Usado');
    });

    it('deve permitir descarte de produto não reaproveitável', () => {
      cy.visit('/trocas');
      
      cy.get('[data-cy="authorized-trade"]').first().within(() => {
        cy.get('[data-cy="confirm-receipt-button"]').click();
      });
      
      // Marcar produto como não reaproveitável
      cy.get('[data-cy="product-condition"]').select('Danificado - Não revendável');
      cy.get('[data-cy="discard-product"]').check();
      cy.get('[data-cy="discard-reason"]').type('Produto com danos irreversíveis');
      
      cy.get('[data-cy="confirm-receipt"]').click();
      
      // Verificar que produto não voltou ao estoque
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type(testProduct.title);
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-stock"]').should('contain', '10 disponíveis'); // Estoque não alterado
      
      // Verificar registro de descarte
      cy.get('[data-cy="stock-history-button"]').click();
      cy.get('[data-cy="stock-movement-type"]').first().should('contain', 'DESCARTE_TROCA');
    });
  });

  describe('Experiência do Cliente', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('deve exibir status detalhado da troca para o cliente', () => {
      // Criar troca em andamento
      cy.task('db:createTradeWithHistory', {
        userId: 'test-user-1',
        productTitle: testProduct.title,
        currentStatus: 'AUTORIZADA'
      });
      
      cy.visit('/minhas-compras/minhas-trocas');
      
      // Verificar timeline de status
      cy.get('[data-cy="trade-timeline"]').should('be.visible');
      cy.get('[data-cy="status-solicitada"]').should('have.class', 'completed');
      cy.get('[data-cy="status-autorizada"]').should('have.class', 'current');
      cy.get('[data-cy="status-concluida"]').should('have.class', 'pending');
      
      // Verificar detalhes
      cy.get('[data-cy="trade-details-button"]').click();
      cy.get('[data-cy="trade-reason"]').should('be.visible');
      cy.get('[data-cy="trade-photos"]').should('exist');
      cy.get('[data-cy="admin-comments"]').should('be.visible');
    });

    it('deve permitir cancelar troca pendente', () => {
      cy.task('db:createTradeRequest', {
        userId: 'test-user-1',
        status: 'SOLICITADA'
      });
      
      cy.visit('/minhas-compras/minhas-trocas');
      
      cy.get('[data-cy="cancel-trade-button"]').click();
      cy.get('[data-cy="cancellation-reason"]').type('Não preciso mais fazer a troca');
      cy.get('[data-cy="confirm-cancellation"]').click();
      
      cy.get('[data-cy="trade-status"]').should('contain', 'CANCELADA');
      cy.get('[data-cy="cancellation-success"]').should('be.visible');
    });

    it('deve notificar sobre atualizações da troca', () => {
      cy.visit('/minhas-compras/minhas-trocas');
      
      // Simular atualização de status (seria feita pelo admin)
      cy.task('db:updateTradeStatus', {
        tradeId: 'test-trade-1',
        status: 'AUTORIZADA',
        adminComment: 'Troca autorizada após análise'
      });
      
      // Verificar notificação
      cy.get('[data-cy="notifications-bell"]').click();
      cy.get('[data-cy="notification-item"]').should('contain', 'Sua troca foi autorizada');
      
      // Verificar badge de nova notificação
      cy.get('[data-cy="notifications-badge"]').should('be.visible');
    });
  });

  describe('Relatórios e Analytics de Trocas', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      
      // Criar dados de teste para relatórios
      cy.task('db:createTradeTestData');
    });

    it('deve gerar relatório de trocas por período', () => {
      cy.visit('/trocas/relatorios');
      
      cy.get('[data-cy="report-date-start"]').type('2024-01-01');
      cy.get('[data-cy="report-date-end"]').type('2024-12-31');
      cy.get('[data-cy="generate-trade-report"]').click();
      
      // Verificar métricas do relatório
      cy.get('[data-cy="total-trades"]').should('be.visible');
      cy.get('[data-cy="approved-trades"]').should('be.visible');
      cy.get('[data-cy="rejected-trades"]').should('be.visible');
      cy.get('[data-cy="trade-value-total"]').should('be.visible');
      
      // Verificar gráficos
      cy.get('[data-cy="trades-by-reason-chart"]').should('be.visible');
      cy.get('[data-cy="trades-timeline-chart"]').should('be.visible');
      
      // Exportar relatório
      cy.get('[data-cy="export-trades-report"]').click();
      cy.get('[data-cy="download-success"]').should('be.visible');
    });

    it('deve mostrar produtos com mais trocas', () => {
      cy.visit('/trocas/analytics');
      
      cy.get('[data-cy="most-traded-products"]').should('be.visible');
      cy.get('[data-cy="product-trade-count"]').should('have.length.greaterThan', 0);
      
      // Verificar detalhes do produto com mais trocas
      cy.get('[data-cy="product-trade-details"]').first().click();
      cy.get('[data-cy="trade-reasons-breakdown"]').should('be.visible');
      cy.get('[data-cy="trade-trend-chart"]').should('be.visible');
    });
  });
});

