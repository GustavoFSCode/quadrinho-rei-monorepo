describe('Excluir últimos 5 clientes', () => {
  it('Deve excluir os últimos 5 clientes da tabela', () => {
    cy.visit('http://localhost:3000/clientes');

    // Executa a exclusão 5 vezes de forma sequencial
    Cypress._.times(5, () => {
      // Verifica se há ao menos uma linha na tabela
      cy.get('tbody tr').then($rows => {
        if ($rows.length === 0) {
          cy.log('Nenhum cliente encontrado para excluir');
          return;
        }
      });

      // Na última linha, clica no ícone Trash (supondo que seja o primeiro SVG)
      cy.get('tbody tr')
        .last()
        .within(() => {
          cy.get('svg').first().click();
        });

      // Aguarda o modal de exclusão aparecer
      cy.contains('Deseja excluir o cliente?').should('be.visible');

      // Clica no botão "Sim" para confirmar a exclusão
      cy.contains('Sim').click();

      // Aguarda o modal de confirmação (que exibe "Cliente excluído!") aparecer
      cy.contains('Cliente excluído!').should('be.visible');

      // Clica no botão "Continuar" para fechar o modal de confirmação
      cy.contains('Continuar').click();

      // Aguarda um breve período para a exclusão ser processada
      cy.wait(500);
    });
  });
});
