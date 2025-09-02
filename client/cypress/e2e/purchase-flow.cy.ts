/**
 * Testes E2E - Fluxo Completo de Compra
 * Cobre: Carrinho → Checkout → Pagamento → Finalização
 * Issues: RN0031-RN0032, RF0034, RN0033-RN0036, RF0053
 */

describe('Fluxo de Compra E2E', () => {
  const testUser = {
    email: 'test@quadrinhoroi.com',
    password: 'Test123456',
    cpf: '12345678901'
  };

  const testProduct = {
    title: 'Spider-Man Test Edition',
    author: 'Stan Lee',
    publisher: 'Marvel',
    price: 29.90,
    stock: 10
  };

  beforeEach(() => {
    // Reset do banco e dados de teste
    cy.task('db:seed');
    cy.visit('/');
    
    // Login do usuário de teste
    cy.login(testUser.email, testUser.password);
  });

  afterEach(() => {
    // Cleanup após cada teste
    cy.task('db:cleanup');
  });

  describe('Adicionar Produto ao Carrinho', () => {
    it('deve validar estoque antes de adicionar produto (RN0031)', () => {
      cy.visit('/estoque');
      
      // Buscar produto de teste
      cy.get('[data-cy="product-search"]').type(testProduct.title);
      cy.get('[data-cy="search-button"]').click();
      
      // Verificar produto disponível
      cy.get('[data-cy="product-card"]').first().should('contain', testProduct.title);
      cy.get('[data-cy="product-stock"]').should('contain', `${testProduct.stock} disponíveis`);
      
      // Adicionar ao carrinho
      cy.get('[data-cy="add-to-cart-button"]').first().click();
      
      // Validar que produto foi adicionado
      cy.get('[data-cy="cart-notification"]').should('contain', 'Produto adicionado ao carrinho');
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      
      // Verificar redução do estoque
      cy.reload();
      cy.get('[data-cy="product-stock"]').should('contain', `${testProduct.stock - 1} disponíveis`);
    });

    it('deve bloquear adição quando estoque insuficiente (RN0031)', () => {
      // Simular produto com estoque baixo
      cy.task('db:updateProductStock', { productId: 'test-product-1', stock: 0 });
      
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type(testProduct.title);
      cy.get('[data-cy="search-button"]').click();
      
      // Tentar adicionar produto sem estoque
      cy.get('[data-cy="add-to-cart-button"]').first().should('be.disabled');
      cy.get('[data-cy="out-of-stock-message"]').should('be.visible');
      cy.get('[data-cy="out-of-stock-message"]').should('contain', 'Fora de estoque');
    });

    it('deve notificar sobre estoque baixo mas permitir compra (RN0031)', () => {
      // Produto com estoque crítico
      cy.task('db:updateProductStock', { productId: 'test-product-1', stock: 2 });
      
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type(testProduct.title);
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="add-to-cart-button"]').first().click();
      
      // Validar aviso de estoque baixo
      cy.get('[data-cy="low-stock-warning"]').should('be.visible');
      cy.get('[data-cy="low-stock-warning"]').should('contain', 'Últimas unidades');
      
      // Mas deve permitir adicionar
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });
  });

  describe('Validação Automática do Carrinho', () => {
    beforeEach(() => {
      // Adicionar produtos ao carrinho
      cy.addProductToCart('test-product-1', 2);
      cy.addProductToCart('test-product-2', 1);
    });

    it('deve validar todo carrinho automaticamente (RN0032)', () => {
      cy.visit('/carrinho');
      
      // Trigger validação automática
      cy.get('[data-cy="validate-cart-button"]').click();
      
      // Verificar validação em andamento
      cy.get('[data-cy="cart-validation-spinner"]').should('be.visible');
      
      // Verificar resultado da validação
      cy.get('[data-cy="validation-summary"]').should('be.visible');
      cy.get('[data-cy="validation-total"]').should('contain', '3 produtos analisados');
      cy.get('[data-cy="validation-status"]').should('contain', 'Carrinho válido');
    });

    it('deve remover automaticamente produtos sem estoque', () => {
      // Simular produto ficando sem estoque
      cy.task('db:updateProductStock', { productId: 'test-product-1', stock: 0 });
      
      cy.visit('/carrinho');
      cy.get('[data-cy="validate-cart-button"]').click();
      
      // Verificar remoção automática
      cy.get('[data-cy="removed-items-alert"]').should('be.visible');
      cy.get('[data-cy="removed-items-list"]').should('contain', testProduct.title);
      
      // Verificar que produto foi removido da lista
      cy.get('[data-cy="cart-items"]').should('not.contain', testProduct.title);
    });

    it('deve ajustar quantidade quando estoque insuficiente', () => {
      // Reduzir estoque para menos que quantidade no carrinho
      cy.task('db:updateProductStock', { productId: 'test-product-1', stock: 1 });
      
      cy.visit('/carrinho');
      cy.get('[data-cy="validate-cart-button"]').click();
      
      // Verificar ajuste automático
      cy.get('[data-cy="adjusted-items-alert"]').should('be.visible');
      cy.get('[data-cy="adjusted-items-list"]').should('contain', 'quantidade ajustada para 1');
      
      // Verificar quantidade atualizada
      cy.get('[data-cy="cart-item-quantity"]').first().should('have.value', '1');
    });
  });

  describe('Cálculo de Frete', () => {
    beforeEach(() => {
      cy.addProductToCart('test-product-1', 1);
      cy.visit('/carrinho/realizar-compra');
    });

    it('deve calcular frete por CEP (RF0034)', () => {
      // Selecionar endereço ou inserir CEP
      cy.get('[data-cy="cep-input"]').type('01310-100'); // CEP de São Paulo
      cy.get('[data-cy="calculate-freight-button"]').click();
      
      // Verificar cálculo de frete
      cy.get('[data-cy="freight-options"]').should('be.visible');
      cy.get('[data-cy="freight-sedex"]').should('contain', 'SEDEX');
      cy.get('[data-cy="freight-pac"]').should('contain', 'PAC');
      
      // Verificar valores
      cy.get('[data-cy="freight-sedex-price"]').should('match', /R\$ \d+,\d{2}/);
      cy.get('[data-cy="freight-pac-price"]').should('match', /R\$ \d+,\d{2}/);
      
      // Selecionar opção
      cy.get('[data-cy="freight-sedex"]').click();
      
      // Verificar que frete foi adicionado ao total
      cy.get('[data-cy="order-total"]').should('contain', 'Frete: R$');
    });

    it('deve calcular frete baseado no peso dos produtos', () => {
      // Adicionar produto pesado
      cy.addProductToCart('heavy-product-1', 1);
      cy.visit('/carrinho/realizar-compra');
      
      cy.get('[data-cy="cep-input"]').type('01310-100');
      cy.get('[data-cy="calculate-freight-button"]').click();
      
      // Verificar que frete é mais caro para produto pesado
      cy.get('[data-cy="freight-sedex-price"]').invoke('text').then((heavyPrice) => {
        cy.get('[data-cy="cart-remove-item"]').last().click(); // Remover produto pesado
        cy.get('[data-cy="calculate-freight-button"]').click();
        
        cy.get('[data-cy="freight-sedex-price"]').invoke('text').should((lightPrice) => {
          const heavyValue = parseFloat(heavyPrice.replace('R$ ', '').replace(',', '.'));
          const lightValue = parseFloat(lightPrice.replace('R$ ', '').replace(',', '.'));
          expect(heavyValue).to.be.greaterThan(lightValue);
        });
      });
    });
  });

  describe('Validações de Pagamento', () => {
    beforeEach(() => {
      cy.addProductToCart('test-product-1', 1);
      cy.visit('/carrinho/realizar-compra');
      
      // Configurar endereço
      cy.get('[data-cy="cep-input"]').type('01310-100');
      cy.get('[data-cy="calculate-freight-button"]').click();
      cy.get('[data-cy="freight-pac"]').click();
    });

    it('deve validar múltiplos cartões com valor mínimo (RN0034-RN0035)', () => {
      const cardValue1 = 15.00;
      const cardValue2 = 20.00;
      
      // Adicionar primeiro cartão
      cy.get('[data-cy="payment-method-card"]').click();
      cy.get('[data-cy="add-payment-card"]').click();
      
      cy.fillCreditCardForm({
        number: '4111111111111111',
        name: 'João Silva',
        expiry: '12/25',
        cvv: '123',
        value: cardValue1
      });
      
      // Adicionar segundo cartão
      cy.get('[data-cy="add-payment-card"]').click();
      cy.fillCreditCardForm({
        number: '5555555555554444',
        name: 'João Silva',
        expiry: '12/25',
        cvv: '456',
        value: cardValue2
      });
      
      // Verificar validação de valores mínimos
      cy.get('[data-cy="card-value-error"]').should('not.exist');
      
      // Tentar valor abaixo do mínimo
      cy.get('[data-cy="card-1-value"]').clear().type('5.00');
      cy.get('[data-cy="card-value-error"]').should('contain', 'Valor mínimo R$ 10,00');
    });

    it('deve validar apenas 1 cupom promocional por compra (RN0033)', () => {
      // Adicionar primeiro cupom
      cy.get('[data-cy="coupon-input"]').type('DESCONTO10');
      cy.get('[data-cy="apply-coupon-button"]').click();
      
      cy.get('[data-cy="applied-coupons"]').should('contain', 'DESCONTO10');
      cy.get('[data-cy="discount-amount"]').should('be.visible');
      
      // Tentar adicionar segundo cupom promocional
      cy.get('[data-cy="coupon-input"]').clear().type('FRETEGRATIS');
      cy.get('[data-cy="apply-coupon-button"]').click();
      
      cy.get('[data-cy="coupon-error"]').should('contain', 'Apenas 1 cupom promocional permitido');
      cy.get('[data-cy="applied-coupons"]').should('not.contain', 'FRETEGRATIS');
    });

    it('deve gerar cupom de troco quando necessário (RN0036)', () => {
      const orderValue = 29.90;
      const paymentValue = 50.00;
      const expectedChange = paymentValue - orderValue;
      
      // Pagar valor maior que o pedido
      cy.get('[data-cy="payment-method-card"]').click();
      cy.fillCreditCardForm({
        number: '4111111111111111',
        name: 'João Silva',
        expiry: '12/25',
        cvv: '123',
        value: paymentValue
      });
      
      // Finalizar compra
      cy.get('[data-cy="finalize-order-button"]').click();
      
      // Verificar geração de cupom de troco
      cy.get('[data-cy="change-coupon-generated"]').should('be.visible');
      cy.get('[data-cy="change-coupon-value"]').should('contain', `R$ ${expectedChange.toFixed(2).replace('.', ',')}`);
      cy.get('[data-cy="change-coupon-code"]').should('be.visible');
    });
  });

  describe('Finalização da Compra', () => {
    beforeEach(() => {
      cy.addProductToCart('test-product-1', 2);
      cy.visit('/carrinho/realizar-compra');
      
      // Setup completo
      cy.get('[data-cy="cep-input"]').type('01310-100');
      cy.get('[data-cy="calculate-freight-button"]').click();
      cy.get('[data-cy="freight-pac"]').click();
      
      cy.get('[data-cy="payment-method-card"]').click();
      cy.fillCreditCardForm({
        number: '4111111111111111',
        name: 'João Silva',
        expiry: '12/25',
        cvv: '123',
        value: 35.00
      });
    });

    it('deve criar compra com status EM_PROCESSAMENTO (RF0037)', () => {
      cy.get('[data-cy="finalize-order-button"]').click();
      
      // Verificar criação da compra
      cy.get('[data-cy="purchase-success-message"]').should('be.visible');
      cy.get('[data-cy="purchase-id"]').should('be.visible');
      
      // Verificar status inicial
      cy.get('[data-cy="purchase-status"]').should('contain', 'EM PROCESSAMENTO');
      
      // Verificar redirecionamento para página de confirmação
      cy.url().should('include', '/compra/confirmada');
    });

    it('deve baixar estoque automaticamente após finalização (RF0053)', () => {
      const initialStock = testProduct.stock;
      const purchasedQuantity = 2;
      
      cy.get('[data-cy="finalize-order-button"]').click();
      cy.get('[data-cy="purchase-success-message"]').should('be.visible');
      
      // Verificar baixa no estoque
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type(testProduct.title);
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-stock"]').should('contain', `${initialStock - purchasedQuantity} disponíveis`);
    });

    it('deve limpar carrinho após finalização', () => {
      cy.get('[data-cy="finalize-order-button"]').click();
      cy.get('[data-cy="purchase-success-message"]').should('be.visible');
      
      // Verificar carrinho vazio
      cy.visit('/carrinho');
      cy.get('[data-cy="empty-cart-message"]').should('be.visible');
      cy.get('[data-cy="cart-count"]').should('contain', '0');
    });
  });

  describe('Fluxo de Aprovação/Reprovação', () => {
    it('deve processar aprovação de compra', () => {
      // Criar compra
      cy.completePurchaseFlow();
      
      // Simular processo de aprovação (admin)
      cy.loginAsAdmin();
      cy.visit('/vendas');
      
      cy.get('[data-cy="pending-purchases"]').first().click();
      cy.get('[data-cy="approve-purchase-button"]').click();
      
      // Verificar mudança de status
      cy.get('[data-cy="purchase-status"]').should('contain', 'APROVADA');
      
      // Verificar que estoque foi baixado (RN0028 - deve baixar apenas quando aprovada)
      cy.visit('/estoque');
      cy.verifyStockReduction('test-product-1', 2);
    });

    it('deve processar reprovação de compra', () => {
      cy.completePurchaseFlow();
      
      cy.loginAsAdmin();
      cy.visit('/vendas');
      
      cy.get('[data-cy="pending-purchases"]').first().click();
      cy.get('[data-cy="reject-purchase-button"]').click();
      cy.get('[data-cy="rejection-reason"]').type('Pagamento não processado');
      cy.get('[data-cy="confirm-rejection-button"]').click();
      
      // Verificar mudança de status
      cy.get('[data-cy="purchase-status"]').should('contain', 'REPROVADA');
      
      // Verificar que estoque foi devolvido
      cy.visit('/estoque');
      cy.verifyStockRestoration('test-product-1', testProduct.stock);
    });
  });

  describe('Integração com Outros Sistemas', () => {
    it('deve calcular e atualizar ranking do cliente após compra', () => {
      const clientId = 'test-client-1';
      
      // Verificar ranking inicial
      cy.task('db:getClientRanking', clientId).then((initialRanking) => {
        cy.completePurchaseFlow();
        
        // Aprovar compra
        cy.loginAsAdmin();
        cy.approvePurchase('latest');
        
        // Verificar atualização do ranking
        cy.task('db:getClientRanking', clientId).then((newRanking) => {
          expect(newRanking as number).to.be.greaterThan(initialRanking as number);
        });
      });
    });

    it('deve enviar notificações durante o fluxo', () => {
      cy.completePurchaseFlow();
      
      // Verificar notificação de confirmação de pedido
      cy.get('[data-cy="notifications-panel"]').click();
      cy.get('[data-cy="notification-item"]').should('contain', 'Pedido confirmado');
      
      // Simular aprovação e verificar notificação
      cy.loginAsAdmin();
      cy.approvePurchase('latest');
      
      cy.loginAsUser(testUser.email, testUser.password);
      cy.get('[data-cy="notifications-panel"]').click();
      cy.get('[data-cy="notification-item"]').should('contain', 'Pedido aprovado');
    });
  });
});

