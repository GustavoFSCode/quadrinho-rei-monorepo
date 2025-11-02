/**
 * Teste E2E - Gerenciamento de Status de Pedidos (Admin)
 *
 * Teste do fluxo administrativo de mudança de status de pedidos:
 * 1. Login como admin
 * 2. Acessa o último pedido realizado
 * 3. Muda status sequencialmente: Pagamento realizado → Em transporte → Entregue
 */

describe('Admin - Gerenciamento de Status de Pedidos E2E', () => {

  it('Deve alterar status do último pedido através de 3 mudanças sequenciais', () => {

    // PASSO 2: Navegar para página de Vendas
    cy.log('===== PASSO 2: Acessar página de Vendas =====');
    cy.visit('http://localhost:3000/vendas');
    cy.wait(2000);

    // PASSO 3: Verificar existência de pedidos e identificar o último
    cy.log('===== PASSO 3: Identificar último pedido =====');
    cy.get('body').then(($body) => {
      // Verificar se existem pedidos na página
      const orderHeaders = $body.find('span:contains("Pedido - #")');

      if (orderHeaders.length === 0) {
        throw new Error('Nenhum pedido encontrado na página /vendas');
      }

      cy.log(`Total de pedidos encontrados: ${orderHeaders.length}`);
      cy.log('Selecionando o primeiro pedido (mais recente por ordenação DESC)');
    });

    // Aguardar para garantir que os dropdowns estejam renderizados
    cy.wait(1000);

    // PASSO 4: Primeira mudança de status - "Pagamento realizado" (2ª opção)
    cy.log('===== PASSO 4: Mudar status para "Pagamento realizado" =====');

    // Encontrar o primeiro dropdown de status (último pedido criado)
    cy.get('[id^="status-"]').first().click();
    cy.wait(500);

    // Selecionar a 2ª opção (índice 1)
    cy.get('div[role="option"]').eq(1).click();
    cy.wait(1500);

    // Validar mensagem de sucesso
    cy.contains('Status alterado com sucesso!').should('be.visible');
    cy.wait(2500); // Wait extra para o toast desaparecer completamente
    cy.log('Status alterado para "Pagamento realizado"');

    // PASSO 5: Segunda mudança de status - "Em transporte" (6ª opção)
    cy.log('===== PASSO 5: Mudar status para "Em transporte" =====');

    // Clicar novamente no dropdown do mesmo pedido
    cy.get('[id^="status-"]').first().click();
    cy.wait(500);

    // Selecionar a 6ª opção (índice 5)
    cy.get('div[role="option"]').eq(5).click();
    cy.wait(1500);

    // Validar mensagem de sucesso
    cy.contains('Status alterado com sucesso!').should('be.visible');
    cy.wait(2500); // Wait extra para o toast desaparecer completamente
    cy.log('Status alterado para "Em transporte"');

    // PASSO 6: Terceira mudança de status - "Entregue" (3ª opção)
    cy.log('===== PASSO 6: Mudar status para "Entregue" =====');

    // Clicar novamente no dropdown do mesmo pedido
    cy.get('[id^="status-"]').first().click();
    cy.wait(500);

    // Selecionar a 3ª opção (índice 2)
    cy.get('div[role="option"]').eq(2).click();
    cy.wait(1500);

    // Validar mensagem de sucesso
    cy.contains('Status alterado com sucesso!').should('be.visible');
    cy.wait(2500); // Wait extra para o toast desaparecer completamente
    cy.log('Status alterado para "Entregue"');

    // PASSO 7: Validação final
    cy.log('===== PASSO 7: Validação final =====');
    cy.log('Todas as mudanças de status foram concluídas com sucesso!');

    // Verificar que o status dropdown ainda está acessível (página não quebrou)
    cy.get('[name^="status-"]').first().should('exist');
    cy.log('Fluxo completo de gerenciamento de pedido finalizado');
  });
});
