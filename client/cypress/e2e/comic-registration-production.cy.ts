/**
 * Teste E2E - Cadastro Completo de Quadrinhos em Produção
 * Cobre: Registro completo de quadrinho com todos os campos obrigatórios
 */

describe('Cadastro Completo de Quadrinhos - Produção', () => {
  // Dados realísticos de um quadrinho completo
  const testComic = {
    title: 'The Amazing Spider-Man #1',
    author: 'Stan Lee, Steve Ditko',
    publisher: 'Marvel Comics',
    year: 2023,
    issue: '1',
    edition: 'Primeira Edição',
    pages: 32,
    synopsis: 'Peter Parker volta às origens em uma nova aventura épica como o Homem-Aranha.',
    isbn: '9780785190219',
    barcode: '76194134017000111',
    price: 25.90,
    stock: 15
  };

  beforeEach(() => {
    cy.task('db:seed');
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.task('db:cleanup');
  });

  it('deve cadastrar um quadrinho completo com todos os campos obrigatórios', () => {
    cy.visit('/estoque');
    cy.url().should('include', '/estoque');

    // Abrir modal de cadastro
    cy.contains('button', 'Cadastrar quadrinho').click();
    
    // Aguardar modal aparecer
    cy.get('form').should('be.visible');

    // Preencher campos básicos
    cy.get('#title').type(testComic.title);
    cy.get('#author').type(testComic.author);
    cy.get('#publisher').type(testComic.publisher);
    cy.get('#year').clear().type(testComic.year.toString());
    cy.get('#issue').type(testComic.issue);
    cy.get('#edition').type(testComic.edition);
    cy.get('#pages').clear().type(testComic.pages.toString());
    cy.get('#synopsis').type(testComic.synopsis);
    cy.get('#isbn').type(testComic.isbn);
    cy.get('#barcode').type(testComic.barcode);

    // Preencher dimensões
    cy.get('#dimensions\\.height').clear().type('26');
    cy.get('#dimensions\\.width').clear().type('17');
    cy.get('#dimensions\\.weight').clear().type('0.08');
    cy.get('#dimensions\\.depth').clear().type('0.3');

    // Preencher preço
    cy.get('#price').clear().type('25,90');

    // Preencher estoque
    cy.get('#stock').clear().type(testComic.stock.toString());

    // Submeter formulário
    cy.get('button[type="submit"]').click();

    // Verificar sucesso
    cy.get('.toast-success, [role="alert"]').should('be.visible');
  });

  it('deve validar campos obrigatórios', () => {
    cy.visit('/estoque');
    cy.contains('button', 'Cadastrar quadrinho').click();
    cy.get('form').should('be.visible');

    // Tentar submeter sem preencher
    cy.get('button[type="submit"]').click();

    // Verificar validações
    cy.get('.error, [class*="error"]').should('have.length.greaterThan', 0);
  });
});