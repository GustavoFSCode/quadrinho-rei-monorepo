/// <reference types="cypress" />

// Custom commands for e-commerce testing
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@quadrinhoroi.com', 'Admin123456');
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('loginAsUser', (email: string, password: string) => {
  cy.login(email, password);
});

Cypress.Commands.add('addProductToCart', (productId: string, quantity: number) => {
  cy.request({
    method: 'POST',
    url: '/api/operations/createOrder',
    body: { product: productId, quantity },
    headers: { 'Authorization': 'Bearer ' + Cypress.env('userToken') }
  });
});

Cypress.Commands.add('completePurchaseFlow', () => {
  cy.addProductToCart('test-product-1', 1);
  cy.visit('/carrinho/realizar-compra');
  
  cy.get('[data-cy="cep-input"]').type('01310-100');
  cy.get('[data-cy="calculate-freight"]').click();
  cy.get('[data-cy="select-freight-pac"]').click();
  
  cy.get('[data-cy="payment-card"]').click();
  cy.get('[data-cy="card-number"]').type('4111111111111111');
  cy.get('[data-cy="card-name"]').type('João Silva');
  cy.get('[data-cy="card-expiry"]').type('12/25');
  cy.get('[data-cy="card-cvv"]').type('123');
  
  cy.get('[data-cy="finalize-order"]').click();
  cy.get('[data-cy="purchase-success"]').should('be.visible');
});

Cypress.Commands.add('approvePurchase', (purchaseIdentifier: string) => {
  if (purchaseIdentifier === 'latest') {
    cy.visit('/vendas');
    cy.get('[data-cy="pending-purchase"]').first().click();
  } else {
    cy.visit(`/vendas/${purchaseIdentifier}`);
  }
  
  cy.get('[data-cy="approve-purchase"]').click();
  cy.get('[data-cy="approval-success"]').should('be.visible');
});

Cypress.Commands.add('verifyProductStock', (productTitle: string, expectedStock: number) => {
  cy.get('[data-cy="product-search"]').clear().type(productTitle);
  cy.get('[data-cy="search-button"]').click();
  cy.get('[data-cy="product-stock"]').should('contain', `${expectedStock} disponíveis`);
});

Cypress.Commands.add('verifyStockReduction', (productId: string, expectedReduction: number) => {
  cy.visit('/estoque');
  cy.get('[data-cy="product-search"]').type(productId);
  cy.get('[data-cy="search-button"]').click();
  cy.get('[data-cy="product-stock"]').should('be.visible');
});

Cypress.Commands.add('verifyStockRestoration', (productId: string, originalStock: number) => {
  cy.visit('/estoque');
  cy.get('[data-cy="product-search"]').type(productId);
  cy.get('[data-cy="search-button"]').click();
  cy.get('[data-cy="product-stock"]').should('contain', `${originalStock} disponíveis`);
});

Cypress.Commands.add('fillCreditCardForm', (cardData: any) => {
  cy.get('[data-cy="card-number"]').type(cardData.number);
  cy.get('[data-cy="card-name"]').type(cardData.name);
  cy.get('[data-cy="card-expiry"]').type(cardData.expiry);
  cy.get('[data-cy="card-cvv"]').type(cardData.cvv);
  if (cardData.value) {
    cy.get('[data-cy="card-value"]').type(cardData.value.toString());
  }
});

Cypress.Commands.add('updateProductPrice', (productId: string, newPrice: number) => {
  cy.visit('/estoque');
  cy.get('[data-cy="product-search"]').type(productId);
  cy.get('[data-cy="search-button"]').click();
  cy.get('[data-cy="product-edit"]').first().click();
  cy.get('[data-cy="product-price"]').clear().type(newPrice.toString());
  cy.get('[data-cy="save-product"]').click();
});

Cypress.Commands.add('restockProduct', (productId: string, quantity: number) => {
  cy.visit('/estoque');
  cy.get('[data-cy="product-search"]').type(productId);
  cy.get('[data-cy="search-button"]').click();
  cy.get('[data-cy="product-actions"]').first().click();
  cy.get('[data-cy="stock-entry"]').click();
  cy.get('[data-cy="stock-quantity"]').type(quantity.toString());
  cy.get('[data-cy="confirm-stock-entry"]').click();
});

// TypeScript declarations for all custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      loginAsAdmin(): Chainable<void>
      loginAsUser(email: string, password: string): Chainable<void>
      addProductToCart(productId: string, quantity: number): Chainable<void>
      completePurchaseFlow(): Chainable<void>
      approvePurchase(purchaseIdentifier: string): Chainable<void>
      verifyProductStock(productTitle: string, expectedStock: number): Chainable<void>
      verifyStockReduction(productId: string, expectedReduction: number): Chainable<void>
      verifyStockRestoration(productId: string, originalStock: number): Chainable<void>
      fillCreditCardForm(cardData: any): Chainable<void>
      updateProductPrice(productId: string, newPrice: number): Chainable<void>
      restockProduct(productId: string, quantity: number): Chainable<void>
    }
  }
}

export {};