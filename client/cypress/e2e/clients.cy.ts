describe('Página de Clientes', () => {
  it('Deve visitar a rota e digitar "Gustavo" no input de busca', () => {
    // Visita a página de clientes
    cy.visit('http://localhost:3000/clientes')

    // Seleciona o input pelo ID e digita "Gustavo"
    cy.get('#search').type('Gustavo')

    // Opcional: Verifica se o input possui o valor digitado
    cy.get('#search').should('have.value', 'Gustavo')
  })
})
