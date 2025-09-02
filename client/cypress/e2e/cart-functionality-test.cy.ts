/**
 * Teste E2E - Funcionalidade do Carrinho
 * Testa especificamente o erro 500 ao adicionar produtos no carrinho
 */

describe('Funcionalidade do Carrinho', () => {
  beforeEach(() => {
    cy.task('db:seed');
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.task('db:cleanup');
  });

  it('deve adicionar produto ao carrinho sem erro 500', () => {
    // Interceptar a chamada da API do carrinho
    cy.intercept('POST', '/api/createOrder').as('addToCart');

    // Ir para a página de produtos/estoque
    cy.visit('/');
    
    // Simular tentativa de adicionar ao carrinho via API
    cy.request({
      method: 'POST',
      url: '/api/getProductsUser',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.not.eq(500);
      
      if (response.status === 200 && response.body.length > 0) {
        const firstProduct = Array.isArray(response.body) ? response.body[0] : response.body.data[0];
        
        // Tentar adicionar o produto ao carrinho
        cy.request({
          method: 'POST',
          url: '/api/createOrder',
          body: {
            product: firstProduct.documentId,
            quantity: 1
          },
          failOnStatusCode: false,
          headers: {
            'Authorization': `Bearer ${Cypress.env('userToken')}`
          }
        }).then((cartResponse) => {
          // Log para debug
          cy.log(`Cart response status: ${cartResponse.status}`);
          cy.log(`Cart response body:`, cartResponse.body);
          
          // Verificar se não é erro 500
          expect(cartResponse.status).to.not.eq(500);
          
          // Se deu erro, verificar qual foi
          if (cartResponse.status !== 200 && cartResponse.status !== 201) {
            cy.log(`Erro no carrinho: ${cartResponse.status} - ${JSON.stringify(cartResponse.body)}`);
          }
        });
      } else {
        cy.log('Nenhum produto disponível para teste');
      }
    });
  });

  it('deve validar campos obrigatórios na API do carrinho', () => {
    // Testar sem produto
    cy.request({
      method: 'POST',
      url: '/api/createOrder',
      body: {
        quantity: 1
      },
      failOnStatusCode: false,
      headers: {
        'Authorization': `Bearer ${Cypress.env('userToken')}`
      }
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.exist;
    });

    // Testar sem quantidade
    cy.request({
      method: 'POST',
      url: '/api/createOrder', 
      body: {
        product: 'test-product-id'
      },
      failOnStatusCode: false,
      headers: {
        'Authorization': `Bearer ${Cypress.env('userToken')}`
      }
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404]);
    });
  });

  it('deve tratar erro de produto inexistente', () => {
    cy.request({
      method: 'POST',
      url: '/api/createOrder',
      body: {
        product: 'produto-inexistente-123',
        quantity: 1
      },
      failOnStatusCode: false,
      headers: {
        'Authorization': `Bearer ${Cypress.env('userToken')}`
      }
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404]);
      expect(response.body.error).to.exist;
      expect(response.body.error.message).to.include('não encontrado');
    });
  });

  it('deve validar estoque insuficiente', () => {
    // Primeiro, buscar um produto
    cy.request('GET', '/api/getProductsUser').then((response) => {
      if (response.body.length > 0) {
        const product = Array.isArray(response.body) ? response.body[0] : response.body.data[0];
        
        // Tentar adicionar quantidade muito alta
        cy.request({
          method: 'POST',
          url: '/api/createOrder',
          body: {
            product: product.documentId,
            quantity: 99999 // Quantidade impossível
          },
          failOnStatusCode: false,
          headers: {
            'Authorization': `Bearer ${Cypress.env('userToken')}`
          }
        }).then((cartResponse) => {
          expect(cartResponse.status).to.eq(400);
          expect(cartResponse.body.error.message).to.include('estoque');
        });
      }
    });
  });
});