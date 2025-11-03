/**
 * Teste E2E - Solicitação de Reembolso (Cliente)
 *
 * Teste do fluxo de solicitação de reembolso de um produto:
 * 1. Acessa /minhas-compras
 * 2. Seleciona o último pedido
 * 3. Marca checkbox "Selecionar para reembolso"
 * 4. Aumenta quantidade para 3 (clica no "+" 2 vezes)
 * 5. Clica em "Reembolso"
 * 6. Valida sucesso
 *
 * PRÉ-REQUISITO: Deve existir pelo menos 1 pedido com status "Entregue"
 * e com quantidade disponível para reembolso >= 3.
 *
 * Para garantir isso, execute antes:
 * 1. completeSaleFlow.cy.ts (cria um pedido)
 * 2. adminOrderManagement.cy.ts (marca o pedido como "Entregue")
 */

describe('Cliente - Solicitação de Reembolso E2E', () => {

  const testClient = {
    email: 'dynamic.player10@gmail.com',
    password: 'Minato1112!'
  };

  it('Deve solicitar reembolso de 3 unidades do último pedido com sucesso', () => {

    // PASSO 0: Login
    cy.log('===== PASSO 0: Login =====');
    cy.visit('http://localhost:3000/login');
    cy.wait(1000);

    cy.get('#email').type(testClient.email);
    cy.get('input[type="password"]').type(testClient.password);
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    cy.url().should('include', '/home');
    cy.log('Login realizado com sucesso');

    // PASSO 1: Navegar para Minhas Compras
    cy.log('===== PASSO 1: Navegar para Minhas Compras =====');
    cy.visit('http://localhost:3000/minhas-compras');
    cy.wait(2000); // Aguardar carregamento das compras

    // Verificar que a página carregou
    cy.contains('Minhas compras').should('be.visible');
    cy.log('Página Minhas Compras carregada');

    // PASSO 2: Identificar o último pedido (mais recente)
    cy.log('===== PASSO 2: Identificar último pedido =====');

    // Aguardar que existam pedidos na página
    cy.get('table').should('have.length.greaterThan', 0);
    cy.get('tbody tr').should('have.length.greaterThan', 0);
    cy.wait(1000);
    cy.log('Pedidos encontrados, selecionando o mais recente (primeira tabela)');

    // Verificar se há checkbox disponível (significa que pode fazer reembolso)
    cy.get('body').then(($body) => {
      const checkboxes = $body.find('table').first().find('tbody tr').first().find('input[type="checkbox"]');

      if (checkboxes.length === 0) {
        throw new Error(
          'PRÉ-REQUISITO NÃO ATENDIDO: Nenhum pedido com status "Entregue" encontrado. ' +
          'Execute primeiro: 1) completeSaleFlow.cy.ts, 2) adminOrderManagement.cy.ts'
        );
      }
    });

    // PASSO 3: Selecionar checkbox "Selecionar para reembolso"
    cy.log('===== PASSO 3: Selecionar checkbox de reembolso =====');

    // Encontrar o checkbox na primeira linha da primeira tabela
    cy.get('table').first().find('tbody tr').first().find('input[type="checkbox"]')
      .should('be.visible')
      .click({ force: true });
    cy.wait(1000); // Wait extra para o InputNumber aparecer
    cy.log('Checkbox de reembolso selecionado');

    // PASSO 4: Aumentar quantidade para 3 (clicar no "+" 2 vezes)
    cy.log('===== PASSO 4: Aumentar quantidade para 3 =====');

    // Encontrar o input number na primeira linha
    cy.get('table').first().find('tbody tr').first().find('input[type="number"]')
      .should('be.visible')
      .parent() // Subir para o Container do InputNumber
      .find('button').last() // Último botão é o incremento
      .as('incrementBtn');

    // Clicar 2 vezes
    cy.get('@incrementBtn').click({ force: true });
    cy.wait(500);
    cy.log('Primeira incrementação - quantidade: 2');

    cy.get('@incrementBtn').click({ force: true });
    cy.wait(500);
    cy.log('Segunda incrementação - quantidade: 3');

    // Validar que o valor é 3
    cy.get('table').first().find('tbody tr').first().find('input[type="number"]')
      .should('have.value', '3');
    cy.log('Quantidade confirmada: 3');

    // PASSO 5: Clicar no botão "Reembolso"
    cy.log('===== PASSO 5: Clicar em Reembolso =====');

    cy.get('table').first().find('tbody tr').first().contains('button', 'Reembolso')
      .click({ force: true });
    cy.wait(2000); // Aguardar chamada da API
    cy.log('Botão Reembolso clicado');

    // PASSO 6: Validar sucesso
    cy.log('===== PASSO 6: Validar sucesso =====');

    // Verificar toast de sucesso
    cy.contains('Pedido de reembolso realizado com sucesso!').should('be.visible');
    cy.wait(1000);
    cy.log('Solicitação de reembolso concluída com sucesso!');
  });
});
