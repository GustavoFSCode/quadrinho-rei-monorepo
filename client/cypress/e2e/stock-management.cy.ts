/**
 * Testes E2E - Gestão de Estoque
 * Cobre: Entrada de estoque, Baixa automática, Validações, Inativação
 * Issues: RF0051, RF0053, RN0028, RF0013
 */

describe('Gestão de Estoque E2E', () => {
  const adminUser = {
    email: 'admin@quadrinhoroi.com',
    password: 'Admin123456'
  };

  const testProduct = {
    title: 'Batman Test Issue',
    author: 'Bob Kane',
    publisher: 'DC Comics',
    isbn: '9780123456789',
    price: 35.90,
    stock: 5
  };

  beforeEach(() => {
    cy.task('db:seed');
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.task('db:cleanup');
  });

  describe('Entrada de Estoque', () => {
    it('deve registrar entrada individual de produto (RF0051)', () => {
      cy.visit('/estoque');
      
      // Buscar produto existente
      cy.get('[data-cy="product-search"]').type(testProduct.title);
      cy.get('[data-cy="search-button"]').click();
      
      // Abrir modal de entrada de estoque
      cy.get('[data-cy="product-actions-menu"]').first().click();
      cy.get('[data-cy="stock-entry-option"]').click();
      
      // Preencher dados da entrada
      cy.get('[data-cy="stock-entry-quantity"]').type('10');
      cy.get('[data-cy="stock-entry-cost"]').type('20.50');
      cy.get('[data-cy="stock-entry-supplier"]').select('Fornecedor Teste');
      cy.get('[data-cy="stock-entry-invoice"]').type('NF-2024-001');
      cy.get('[data-cy="stock-entry-date"]').type('2024-08-21');
      
      // Confirmar entrada
      cy.get('[data-cy="confirm-stock-entry"]').click();
      
      // Verificar sucesso
      cy.get('[data-cy="success-message"]').should('contain', 'Entrada de estoque registrada');
      
      // Verificar atualização do estoque
      cy.reload();
      cy.get('[data-cy="product-stock"]').should('contain', `${testProduct.stock + 10} disponíveis`);
      
      // Verificar registro no histórico
      cy.get('[data-cy="stock-history-button"]').click();
      cy.get('[data-cy="stock-entry-record"]').first().should('contain', 'ENTRADA_MANUAL');
      cy.get('[data-cy="stock-entry-quantity"]').first().should('contain', '+10');
    });

    it('deve registrar entrada em lote de múltiplos produtos', () => {
      cy.visit('/estoque');
      
      // Abrir modal de entrada em lote
      cy.get('[data-cy="bulk-stock-entry-button"]').click();
      
      // Upload de arquivo CSV ou entrada manual
      cy.get('[data-cy="bulk-entry-method-manual"]').click();
      
      // Adicionar múltiplos produtos
      cy.get('[data-cy="add-bulk-entry-row"]').click();
      
      // Primeira linha
      cy.get('[data-cy="bulk-product-select-0"]').select(testProduct.title);
      cy.get('[data-cy="bulk-quantity-0"]').type('15');
      cy.get('[data-cy="bulk-cost-0"]').type('18.90');
      
      // Segunda linha
      cy.get('[data-cy="add-bulk-entry-row"]').click();
      cy.get('[data-cy="bulk-product-select-1"]').select('Superman Test Issue');
      cy.get('[data-cy="bulk-quantity-1"]').type('8');
      cy.get('[data-cy="bulk-cost-1"]').type('22.50');
      
      // Dados gerais da entrada
      cy.get('[data-cy="bulk-supplier"]').select('Fornecedor Teste');
      cy.get('[data-cy="bulk-invoice"]').type('NF-2024-002');
      
      // Processar entrada em lote
      cy.get('[data-cy="process-bulk-entry"]').click();
      
      // Verificar progresso
      cy.get('[data-cy="bulk-progress"]').should('be.visible');
      cy.get('[data-cy="bulk-progress-bar"]').should('exist');
      
      // Verificar conclusão
      cy.get('[data-cy="bulk-success-message"]').should('contain', '2 produtos processados');
      
      // Verificar estoques atualizados
      cy.visit('/estoque');
      cy.verifyProductStock(testProduct.title, testProduct.stock + 15);
      cy.verifyProductStock('Superman Test Issue', 8);
    });

    it('deve validar dados obrigatórios na entrada (RN0051)', () => {
      cy.visit('/estoque');
      
      cy.get('[data-cy="product-actions-menu"]').first().click();
      cy.get('[data-cy="stock-entry-option"]').click();
      
      // Tentar confirmar sem preencher campos obrigatórios
      cy.get('[data-cy="confirm-stock-entry"]').click();
      
      // Verificar validações
      cy.get('[data-cy="quantity-error"]').should('contain', 'Quantidade é obrigatória');
      cy.get('[data-cy="cost-error"]').should('contain', 'Custo é obrigatório');
      cy.get('[data-cy="supplier-error"]').should('contain', 'Fornecedor é obrigatório');
      
      // Validar quantidade maior que zero
      cy.get('[data-cy="stock-entry-quantity"]').type('0');
      cy.get('[data-cy="confirm-stock-entry"]').click();
      cy.get('[data-cy="quantity-error"]').should('contain', 'Quantidade deve ser maior que zero');
      
      // Validar custo maior que zero
      cy.get('[data-cy="stock-entry-quantity"]').clear().type('5');
      cy.get('[data-cy="stock-entry-cost"]').type('0');
      cy.get('[data-cy="confirm-stock-entry"]').click();
      cy.get('[data-cy="cost-error"]').should('contain', 'Custo deve ser maior que zero');
    });
  });

  describe('Baixa Automática de Estoque', () => {
    beforeEach(() => {
      // Configurar produto com estoque conhecido
      cy.task('db:updateProductStock', { productId: 'test-product-1', stock: 20 });
    });

    it('deve baixar estoque automaticamente após aprovação de compra (RF0053)', () => {
      const purchaseQuantity = 3;
      const initialStock = 20;
      
      // Simular compra aprovada
      cy.task('db:createApprovedPurchase', {
        productId: 'test-product-1',
        quantity: purchaseQuantity,
        status: 'APROVADA'
      });
      
      // Verificar baixa automática
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type('test-product-1');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-stock"]').should('contain', `${initialStock - purchaseQuantity} disponíveis`);
      
      // Verificar registro no histórico
      cy.get('[data-cy="stock-history-button"]').click();
      cy.get('[data-cy="stock-movement-type"]').first().should('contain', 'BAIXA_VENDA');
      cy.get('[data-cy="stock-movement-quantity"]').first().should('contain', `-${purchaseQuantity}`);
    });

    it('deve validar status antes da baixa (RN0028)', () => {
      const purchaseQuantity = 5;
      const initialStock = 20;
      
      // Simular compra ainda em processamento
      cy.task('db:createPurchase', {
        productId: 'test-product-1',
        quantity: purchaseQuantity,
        status: 'EM_PROCESSAMENTO'
      });
      
      // Verificar que estoque NÃO foi baixado
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type('test-product-1');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-stock"]').should('contain', `${initialStock} disponíveis`);
      
      // Aprovar a compra
      cy.visit('/vendas');
      cy.get('[data-cy="pending-purchase"]').first().click();
      cy.get('[data-cy="approve-purchase"]').click();
      
      // Agora verificar que o estoque foi baixado
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type('test-product-1');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-stock"]').should('contain', `${initialStock - purchaseQuantity} disponíveis`);
    });

    it('deve bloquear baixa de estoque para compras reprovadas', () => {
      const initialStock = 20;
      
      // Simular compra reprovada
      cy.task('db:createPurchase', {
        productId: 'test-product-1',
        quantity: 3,
        status: 'REPROVADA'
      });
      
      // Verificar que estoque não foi baixado
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type('test-product-1');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-stock"]').should('contain', `${initialStock} disponíveis`);
      
      // Verificar que não há registro de baixa no histórico
      cy.get('[data-cy="stock-history-button"]').click();
      cy.get('[data-cy="stock-movements"]').should('not.contain', 'BAIXA_VENDA');
    });
  });

  describe('Validações de Estoque', () => {
    it('deve validar operações de estoque por status de compra', () => {
      // Teste da API de validação
      cy.request({
        method: 'POST',
        url: '/api/operations/validateStockByPurchase/test-purchase-1',
        body: { operation: 'BAIXA' },
        headers: { 'Authorization': 'Bearer ' + Cypress.env('adminToken') }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('isValid');
      });
    });

    it('deve validar estoque de produto antes da operação', () => {
      cy.request({
        method: 'POST',
        url: '/api/operations/validateProductStock/test-product-1',
        body: { quantity: 5, operation: 'BAIXA' },
        headers: { 'Authorization': 'Bearer ' + Cypress.env('adminToken') }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('isValid');
        expect(response.body.isValid).to.be.true;
      });
      
      // Teste com quantidade maior que estoque
      cy.request({
        method: 'POST',
        url: '/api/operations/validateProductStock/test-product-1',
        body: { quantity: 1000, operation: 'BAIXA' },
        headers: { 'Authorization': 'Bearer ' + Cypress.env('adminToken') }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.isValid).to.be.false;
        expect(response.body.message).to.contain('Estoque insuficiente');
      });
    });

    it('deve obter histórico de validações de produto', () => {
      cy.request({
        method: 'GET',
        url: '/api/operations/getProductValidationHistory/test-product-1?limit=5',
        headers: { 'Authorization': 'Bearer ' + Cypress.env('adminToken') }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.data).to.be.an('array');
      });
    });
  });

  describe('Inativação Automática de Produtos', () => {
    it('deve inativar produtos sem estoque e vendas antigas (RF0013)', () => {
      // Configurar produto com estoque zero e sem vendas recentes
      cy.task('db:createOldProduct', {
        title: 'Produto Antigo Test',
        stock: 0,
        lastSale: '2023-01-01',
        active: true
      });
      
      // Executar processo de inativação automática
      cy.request({
        method: 'POST',
        url: '/api/operations/autoInactivateProducts',
        headers: { 'Authorization': 'Bearer ' + Cypress.env('adminToken') }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.inactivated).to.be.greaterThan(0);
      });
      
      // Verificar que produto foi inativado
      cy.visit('/estoque');
      cy.get('[data-cy="show-inactive-toggle"]').click();
      cy.get('[data-cy="product-search"]').type('Produto Antigo Test');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-status"]').should('contain', 'Inativo');
      cy.get('[data-cy="inactivation-reason"]').should('contain', 'Sem estoque e vendas');
    });

    it('deve manter ativos produtos com vendas recentes mesmo sem estoque', () => {
      cy.task('db:createRecentProduct', {
        title: 'Produto Popular Test',
        stock: 0,
        lastSale: new Date().toISOString(),
        active: true
      });
      
      cy.request({
        method: 'POST',
        url: '/api/operations/autoInactivateProducts',
        headers: { 'Authorization': 'Bearer ' + Cypress.env('adminToken') }
      });
      
      // Verificar que produto permanece ativo
      cy.visit('/estoque');
      cy.get('[data-cy="product-search"]').type('Produto Popular Test');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-status"]').should('contain', 'Ativo');
    });

    it('deve configurar parâmetros de inativação automática', () => {
      cy.visit('/estoque/configuracoes');
      
      // Configurar parâmetros
      cy.get('[data-cy="inactivation-days-without-sale"]').clear().type('90');
      cy.get('[data-cy="inactivation-min-price"]').clear().type('10.00');
      cy.get('[data-cy="inactivation-enabled"]').check();
      
      cy.get('[data-cy="save-inactivation-config"]').click();
      cy.get('[data-cy="config-saved-message"]').should('be.visible');
      
      // Verificar que configuração foi salva
      cy.reload();
      cy.get('[data-cy="inactivation-days-without-sale"]').should('have.value', '90');
      cy.get('[data-cy="inactivation-min-price"]').should('have.value', '10.00');
      cy.get('[data-cy="inactivation-enabled"]').should('be.checked');
    });
  });

  describe('Relatórios de Estoque', () => {
    it('deve gerar relatório de movimentações de estoque', () => {
      cy.visit('/estoque/relatorios');
      
      // Configurar filtros
      cy.get('[data-cy="report-date-start"]').type('2024-01-01');
      cy.get('[data-cy="report-date-end"]').type('2024-12-31');
      cy.get('[data-cy="report-movement-type"]').select('TODOS');
      
      // Gerar relatório
      cy.get('[data-cy="generate-stock-report"]').click();
      
      // Verificar relatório gerado
      cy.get('[data-cy="stock-report-table"]').should('be.visible');
      cy.get('[data-cy="report-total-movements"]').should('be.visible');
      cy.get('[data-cy="report-entries-count"]').should('be.visible');
      cy.get('[data-cy="report-exits-count"]').should('be.visible');
      
      // Exportar relatório
      cy.get('[data-cy="export-report-csv"]').click();
      cy.get('[data-cy="download-success"]').should('contain', 'Relatório exportado');
    });

    it('deve exibir alertas de estoque baixo', () => {
      // Configurar produtos com estoque baixo
      cy.task('db:createLowStockProducts');
      
      cy.visit('/estoque/alertas');
      
      // Verificar alertas de estoque baixo
      cy.get('[data-cy="low-stock-alerts"]').should('be.visible');
      cy.get('[data-cy="critical-stock-count"]').should('be.visible');
      cy.get('[data-cy="out-of-stock-count"]').should('be.visible');
      
      // Verificar lista de produtos com estoque baixo
      cy.get('[data-cy="low-stock-product-list"]').should('exist');
      cy.get('[data-cy="low-stock-product"]').should('have.length.greaterThan', 0);
      
      // Testar ação em lote
      cy.get('[data-cy="select-all-low-stock"]').click();
      cy.get('[data-cy="bulk-restock-button"]').click();
      
      cy.get('[data-cy="bulk-restock-quantity"]').type('10');
      cy.get('[data-cy="bulk-restock-supplier"]').select('Fornecedor Teste');
      cy.get('[data-cy="confirm-bulk-restock"]').click();
      
      cy.get('[data-cy="bulk-restock-success"]').should('be.visible');
    });
  });

  describe('Integração com Fornecedores', () => {
    it('deve registrar entrada vinculada a fornecedor', () => {
      cy.visit('/fornecedores');
      
      // Selecionar fornecedor
      cy.get('[data-cy="supplier-card"]').first().click();
      cy.get('[data-cy="create-purchase-order"]').click();
      
      // Criar pedido de compra
      cy.get('[data-cy="add-product-to-order"]').click();
      cy.get('[data-cy="select-product"]').select(testProduct.title);
      cy.get('[data-cy="order-quantity"]').type('20');
      cy.get('[data-cy="order-unit-cost"]').type('15.00');
      
      cy.get('[data-cy="finalize-purchase-order"]').click();
      
      // Simular recebimento
      cy.get('[data-cy="mark-as-received"]').click();
      cy.get('[data-cy="received-quantity"]').type('20');
      cy.get('[data-cy="invoice-number"]').type('NF-2024-003');
      
      cy.get('[data-cy="confirm-receipt"]').click();
      
      // Verificar entrada automática no estoque
      cy.visit('/estoque');
      cy.verifyProductStock(testProduct.title, testProduct.stock + 20);
      
      // Verificar vinculação com fornecedor no histórico
      cy.get('[data-cy="stock-history-button"]').click();
      cy.get('[data-cy="stock-entry-supplier"]').first().should('contain', 'Fornecedor Teste');
    });
  });
});

