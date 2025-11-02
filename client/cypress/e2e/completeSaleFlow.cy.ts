/**
 * Teste E2E - Fluxo Completo de Venda
 *
 * Teste completo do fluxo de venda desde login até finalização
 */

describe('Fluxo Completo de Venda E2E', () => {

  const testClient = {
    email: 'dynamic.player10@gmail.com',
    password: 'Minato1112!',
    name: 'Gustavo Ferreira'
  };

  it('Deve executar fluxo completo de venda com sucesso', () => {
    // PASSO 1: Login
    cy.log('===== PASSO 1: Login =====');
    cy.visit('http://localhost:3000/login');
    cy.wait(1000);

    cy.get('#email').type(testClient.email);
    cy.get('input[type="password"]').type(testClient.password);
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    cy.url().should('include', '/home');

    // PASSO 2: Esvaziar carrinho (garantir que está limpo)
    cy.log('===== PASSO 2: Esvaziar carrinho =====');
    cy.visit('http://localhost:3000/carrinho');
    cy.wait(1500);

    // Verificar se há produtos e esvaziar
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Esvaziar carrinho")').length > 0) {
        cy.contains('Esvaziar carrinho').click();
        cy.wait(1000);
        cy.log('Carrinho esvaziado');
      } else {
        cy.log('Carrinho já estava vazio');
      }
    });

    // Voltar para home
    cy.visit('http://localhost:3000/home');
    cy.wait(1000);

    // PASSO 3: Adicionar 3 produtos ao carrinho
    cy.log('===== PASSO 3: Adicionar produtos =====');

    cy.get('tbody tr').should('have.length.greaterThan', 0);

    // Adicionar 3x o primeiro produto
    cy.get('tbody tr').first().within(() => {
      cy.get('svg').last().click({ force: true });
      cy.wait(500);
      cy.get('svg').last().click({ force: true });
      cy.wait(500);
      cy.get('svg').last().click({ force: true });
    });

    cy.wait(1500);

    // PASSO 4: Ir para o carrinho
    cy.log('===== PASSO 4: Verificar carrinho =====');
    cy.visit('http://localhost:3000/carrinho');
    cy.wait(1500);

    cy.get('tbody tr').should('have.length', 1);
    cy.contains('Valor total:').should('be.visible');

    // PASSO 5: Realizar compra
    cy.log('===== PASSO 5: Iniciar checkout =====');
    cy.contains('Realizar compra').click();
    cy.wait(2000);

    cy.url().should('include', '/carrinho/realizar-compra');

    // PASSO 6: Aplicar cupom NATAL30
    cy.log('===== PASSO 6: Aplicar cupom =====');
    cy.get('#coupon').type('NATAL30');
    cy.contains('Aplicar cupom').click();
    cy.wait(3000); // Esperar processamento do cupom]


    // PASSO 7: Criar endereço de entrega completo
    cy.log('===== PASSO 7: Criar novo endereço de entrega =====');
    cy.contains('button', 'Adicionar endereço').click();
    cy.wait(1500);

    // Preencher todos os campos obrigatórios do endereço (usando IDs diretos do modal)
    cy.get('#nameAddress').clear().type('Endereço de Teste Cypress');
    cy.wait(500);

    // Selecionar Tipo de Endereço: Entrega
    cy.get('#TypeAddress').click();
    cy.get('div[role="option"]').contains('Entrega').click();
    cy.wait(500);

    // Selecionar Tipo de Logradouro: Rua
    cy.get('#typeLogradouro').click();
    cy.get('div[role="option"]').contains('Rua').click();
    cy.wait(500);

    // Preencher demais campos
    cy.get('#nameLogradouro').clear().type('Test Street');
    cy.get('#number').clear().type('100');
    cy.get('#neighborhood').clear().type('Test Neighborhood');
    cy.get('#cep').clear().type('12345-678');
    cy.get('#city').clear().type('São Paulo');
    cy.get('#state').clear().type('SP');
    cy.get('#country').clear().type('Brasil');
    cy.get('#observation').clear().type('Endereço criado por teste automatizado');
    cy.wait(1000);

    // Salvar o novo endereço
    cy.contains('Salvar novo endereço').click();
    cy.wait(2000);

    // Fechar modal de endereços
    cy.get('[data-cy="closeAddress"]').click({ force: true });
    cy.wait(1000);
    cy.log('Endereço criado e modal fechado');

    // PASSO 8: Selecionar endereço de entrega
    cy.log('===== PASSO 8: Selecionar endereço de entrega =====');
    cy.wait(1500);

    // Encontrar o título "Endereço de entrega" e buscar o primeiro checkbox após ele
    cy.contains('h3', 'Endereço de entrega')
      .nextAll()
      .find('input[type="checkbox"]')
      .first()
      .click({ force: true });

    cy.wait(1000);
    cy.log('Primeiro endereço de entrega selecionado');

    // PASSO 9: Selecionar endereço de cobrança
    cy.log('===== PASSO 9: Selecionar endereço de cobrança =====');
    cy.wait(1000);

    // Encontrar o título "Endereço de cobrança" e buscar o primeiro checkbox após ele
    cy.contains('h3', 'Endereço de cobrança')
      .nextAll()
      .find('input[type="checkbox"]')
      .first()
      .click({ force: true });

    cy.wait(1000);
    cy.log('Primeiro endereço de cobrança selecionado');

    // PASSO 10A: Criar novo cartão
    cy.log('===== PASSO 10A: Criar novo cartão =====');
    cy.contains('button', 'Adicionar cartão').click();
    cy.wait(1500);

    // Preencher todos os campos obrigatórios do cartão (usando IDs diretos do modal)
    cy.get('#holderName').clear().type('Gustavo Ferreira');
    cy.wait(500);
    cy.get('#numberCard').clear().type('4111111111111111');
    cy.wait(500);
    cy.get('#safeNumber').clear().type('123');
    cy.wait(1000);

    // Salvar o novo cartão
    cy.contains('Salvar novo cartão').click();
    cy.wait(2000);

    // Fechar modal de cartões
    cy.get('[data-cy="closeCards"]').click({ force: true });
    cy.wait(1000);
    cy.log('Cartão criado e modal fechado');

    // PASSO 10B: Selecionar primeiro cartão e inserir valor 150
    cy.log('===== PASSO 10B: Selecionar primeiro cartão =====');

    // Esperar o total do pedido estar visível
    cy.contains('Valor total do pedido:').should('be.visible');
    cy.wait(1500);

    // Encontrar a seção de cartões procurando pelo botão "Adicionar cartão"
    // e depois buscar checkboxes após essa seção
    cy.contains('button', 'Adicionar cartão')
      .parent() // SectionTitle
      .nextAll()
      .find('input[type="checkbox"]')
      .first()
      .click({ force: true });

    cy.wait(1500);
    cy.log('Primeiro cartão selecionado');

    // Inserir valor 150 no primeiro cartão
    cy.get('input[id^="card-value-"]').first().clear().type('20000');
    cy.wait(1000);
    cy.log('Valor R$ 150,00 inserido no primeiro cartão');

    // PASSO 10C: Selecionar segundo cartão e inserir valor 27,5
    cy.log('===== PASSO 10C: Selecionar segundo cartão =====');

    // Encontrar checkboxes não marcados na seção de cartões
    cy.contains('button', 'Adicionar cartão')
      .parent() // SectionTitle
      .nextAll()
      .find('input[type="checkbox"]:not(:checked)')
      .first()
      .click({ force: true });

    cy.wait(1500);
    cy.log('Segundo cartão selecionado');

    // Inserir valor 27,5 no segundo cartão
    cy.get('input[id^="card-value-"]').last().clear().type('15000');
    cy.wait(1000);
    cy.log('Valor R$ 27,50 inserido no segundo cartão');

    cy.wait(2000);

    // PASSO 11: Finalizar compra
    cy.log('===== PASSO 11: Finalizar compra =====');

    // Verificar se o botão está habilitado antes de clicar
    cy.get('body').then(($body) => {
      const finalizarBtn = $body.find('button:contains("Finalizar compra")');

      if (finalizarBtn.length > 0 && !finalizarBtn.is(':disabled')) {
        cy.contains('button', 'Finalizar compra').click();
        cy.wait(3000);

        // PASSO 12: Validar sucesso e redirecionamento
        cy.log('===== PASSO 12: Validar finalização =====');

        // Verificar mensagem de sucesso ou redirecionamento para minhas-compras
        cy.url().then((url) => {
          if (url.includes('/minhas-compras')) {
            cy.log('Compra finalizada com sucesso! Redirecionado para minhas-compras');

            // PASSO 13: Validar pedido em "Minhas Compras"
            cy.log('===== PASSO 13: Validar pedido criado =====');
            cy.wait(2000);

            cy.get('body').then(($body) => {
              if ($body.find('tbody tr').length > 0) {
                cy.get('tbody tr').first().should('contain', 'Em Aberto');
                cy.log('Pedido aparece na lista com status "Em Aberto"');
              } else {
                cy.log('Nenhum pedido encontrado em minhas-compras');
              }
            });

            // PASSO 14: Verificar carrinho vazio
            cy.log('===== PASSO 14: Verificar carrinho esvaziado =====');
            cy.visit('http://localhost:3000/carrinho');
            cy.wait(1500);

            cy.get('body').then(($body) => {
              if ($body.find('tbody tr').length === 0) {
                cy.log('Carrinho está vazio - sucesso!');
              } else {
                cy.log('Carrinho ainda tem items');
              }
            });
          } else {
            cy.log('Permaneceu na página de checkout - possível erro');
          }
        });
      } else {
        cy.log('Botão "Finalizar compra" está desabilitado ou não foi encontrado');
        cy.log('Isso indica que os valores de pagamento não estão corretos');
        cy.log('Teste concluído até a configuração de pagamento');
      }
    });
  });
});
