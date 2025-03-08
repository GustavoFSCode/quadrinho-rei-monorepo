describe('Edição de Cliente - Fluxo Completo', () => {
  it('Deve editar o último cliente: alterar senha, editar nome/e-mail, adicionar novo endereço e novo cartão', () => {
    // 1. Acessa a página de clientes
    cy.visit('http://localhost:3000/clientes');

    // 2. Clica no ícone Pencil do último cliente da tabela
    cy.get('tbody tr')
      .last()
      .within(() => {
        // O Pencil é o segundo SVG na linha
        cy.get('svg').eq(1).click();
      });

    // 3. Aguarda o modal de edição abrir (verifica o título "Editar Cliente")
    cy.contains('Editar Cliente').should('be.visible');

    // 4. Alterar a senha:
    cy.contains('Alterar senha').click();
    cy.get('#new_password').should('be.visible');
    cy.get('#new_password').clear().type('Spiderman123!');
    cy.get('#confirm_password').clear().type('Spiderman123!');
    cy.contains('Alterar!').click();
    cy.contains('Senha alterada com sucesso!').should('be.visible');
    cy.contains('Voltar').click();

    // 5. Editar nome e e-mail do cliente
    cy.get('input#name').clear().type('Peter Parker');
    cy.get('input#email').clear().type('peter.parker@example.com');
    cy.contains('Editar!').click();
    cy.contains('Voltar').click();

    cy.get('tbody tr')
    .last()
    .within(() => {
      // O Pencil é o segundo SVG na linha
      cy.get('svg').eq(1).click();
    });

  cy.contains('Editar Cliente').should('be.visible');

    // 6. Editar Endereço:
    cy.contains('Gerenciar endereços').click();
    cy.contains('Editar Endereços').should('be.visible');
    cy.contains('Adicionar Endereço').click();

    // Preenche todos os campos do novo endereço:

    // Nome do Endereço
    cy.get('input[id*="nameAddress"]').last().clear().type('Casa do Peter');

    // Seleciona o "Tipo de Endereço" (ex: Cobrança)
cy.get('input[id*="nameAddress"]')
.last()
.parentsUntil('form')
.find('[id*="TypeAddress"]')
.last()
.click();
// Em vez de usar um id fixo, seleciona pela opção pelo texto:
cy.get('div[role="option"]').contains('Cobrança').click();

// Seleciona o "Tipo de Logradouro" (ex: Rua)
cy.get('input[id*="nameAddress"]')
.last()
.parentsUntil('form')
.find('[id*="typeLogradouro"]')
.last()
.click();
cy.get('div[role="option"]').contains('Rua').click();


    // Nome do Logradouro
    cy.get('input[id*="nameLogradouro"]').last().clear().type('Peter Street');

    // Número
    cy.get('input[id*="number"]').last().clear().type('100');

    // Bairro
    cy.get('input[id*="neighborhood"]').last().clear().type('Queens');

    // CEP
    cy.get('input[id*="cep"]').last().clear().type('12345-000');

    // Cidade
    cy.get('input[id*="city"]').last().clear().type('Nova York');

    // Estado
    cy.get('input[id*="state"]').last().clear().type('NY');

    // País
    cy.get('input[id*="country"]').last().clear().type('USA');

    // Observação
    cy.get('input[id*="observation"]').last().clear().type('Casa do Peter');

    // Salva o novo endereço
    cy.contains('Salvar novo endereço').click();

    // Fecha o modal de endereços:
    cy.contains('Ok').click();
    cy.get('[data-cy="closeAddress"]').click();

    // 7. Editar o Cartão:
    cy.contains('Gerenciar cartões').click();
    cy.contains('Editar Cartões').should('be.visible');
    cy.contains('Adicionar Cartão').click();

    // Preenche os campos do novo cartão (último grupo de inputs)
    cy.get('input[id*="holderName"]').last().clear().type('Peter Parker');
    cy.get('input[id*="numberCard"]').last().clear().type('4111111111111111');
    cy.get('input[id*="safeNumber"]').last().clear().type('999');

    // Salva o novo cartão
    cy.contains('Salvar novo cartão').click();

    // Fecha o modal de cartões
    cy.contains('Ok').click();
    cy.get('[data-cy="closeCards"]').click();

    // 8. Submete o formulário de edição do cliente
    cy.get('button[type="submit"]').contains('Editar').click();

    // 9. Valida se a edição foi efetuada com sucesso
    cy.contains('Edição efetuada com sucesso').should('be.visible');
    cy.contains('Voltar').click();

  });
});
