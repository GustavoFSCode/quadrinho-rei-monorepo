/**
 * Teste E2E - Reutilização de Cupom após Esvaziar Carrinho
 *
 * Valida que cupons podem ser aplicados novamente após esvaziar o carrinho
 * Correção: Reset de status de cupons ao esvaziar carrinho
 */

describe('Reutilização de Cupom E2E', () => {

  const testClient = {
    email: 'dynamic.player10@gmail.com',
    password: 'Minato1112!',
    name: 'Gustavo Ferreira'
  };

  const couponCode = 'NATAL30';

  it('Deve permitir aplicar cupom novamente após esvaziar carrinho', () => {
    // PASSO 1: Login
    cy.log('===== PASSO 1: Login =====');
    cy.visit('http://localhost:3000/login');
    cy.wait(1000);

    cy.get('#email').type(testClient.email);
    cy.get('input[type="password"]').type(testClient.password);
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    cy.url().should('include', '/home');

    // PASSO 2: Esvaziar carrinho inicialmente
    cy.log('===== PASSO 2: Limpar carrinho inicial =====');
    cy.visit('http://localhost:3000/carrinho');
    cy.wait(1500);

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Esvaziar carrinho")').length > 0) {
        cy.contains('Esvaziar carrinho').click();
        cy.wait(1000);
      }
    });

    // PASSO 3: Adicionar produto
    cy.log('===== PASSO 3: Adicionar produto =====');
    cy.visit('http://localhost:3000/home');
    cy.wait(1000);

    cy.get('tbody tr').first().within(() => {
      cy.get('svg').last().click({ force: true });
    });
    cy.wait(1500);

    // PASSO 4: Ir para checkout
    cy.log('===== PASSO 4: Ir para checkout =====');
    cy.visit('http://localhost:3000/carrinho');
    cy.wait(1000);
    cy.contains('Realizar compra').click();
    cy.wait(2000);

    // PASSO 5: Aplicar cupom pela primeira vez
    cy.log('===== PASSO 5: Aplicar cupom pela primeira vez =====');
    cy.get('#coupon').type(couponCode);
    cy.contains('Aplicar cupom').click();
    cy.wait(2000);

    cy.log('Cupom aplicado com sucesso pela primeira vez');

    // PASSO 6: Voltar ao carrinho e esvaziar
    cy.log('===== PASSO 6: Esvaziar carrinho =====');
    cy.visit('http://localhost:3000/carrinho');
    cy.wait(1500);

    cy.contains('Esvaziar carrinho').click();
    cy.wait(1500);
    cy.log('Carrinho esvaziado - cupom deve ter sido liberado');

    // PASSO 7: Adicionar produto novamente
    cy.log('===== PASSO 7: Adicionar produto novamente =====');
    cy.visit('http://localhost:3000/home');
    cy.wait(1000);

    cy.get('tbody tr').first().within(() => {
      cy.get('svg').last().click({ force: true });
    });
    cy.wait(1500);

    // PASSO 8: Ir para checkout novamente
    cy.log('===== PASSO 8: Ir para checkout novamente =====');
    cy.visit('http://localhost:3000/carrinho');
    cy.wait(1000);
    cy.contains('Realizar compra').click();
    cy.wait(2000);

    // PASSO 9: Tentar aplicar o mesmo cupom novamente
    cy.log('===== PASSO 9: Aplicar o mesmo cupom novamente =====');
    cy.get('#coupon').clear().type(couponCode);
    cy.contains('Aplicar cupom').click();
    cy.wait(2000);

    // Verificar que NÃO há mensagem de erro
    cy.get('body').then(($body) => {
      const errorText = $body.text().toLowerCase();

      // Verificar que não contém mensagens de erro conhecidas
      expect(errorText).not.to.include('não pode ser utilizado');
      expect(errorText).not.to.include('já foi utilizado');
      expect(errorText).not.to.include('inválido');

      cy.log('✅ Cupom aplicado com sucesso pela segunda vez!');
    });

    cy.log('===== TESTE CONCLUÍDO COM SUCESSO =====');
  });
});
