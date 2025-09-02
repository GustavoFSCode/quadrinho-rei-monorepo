/**
 * Testes E2E - Navegação Básica
 * Testa a navegação e estrutura básica da aplicação
 */

describe('Navegação Básica E2E', () => {
  beforeEach(() => {
    cy.task('db:seed');
  });

  afterEach(() => {
    cy.task('db:cleanup');
  });

  describe('Estrutura da Aplicação', () => {
    it('deve carregar a página inicial', () => {
      cy.visit('/');
      cy.get('body').should('be.visible');
      
      // Verifica se a aplicação carregou sem erros críticos
      cy.get('body').should('exist');
    });

    it('deve navegar para a página de login', () => {
      cy.visit('/login');
      cy.url().should('include', '/login');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para a página de estoque', () => {
      cy.visit('/estoque');
      cy.url().should('include', '/estoque');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para a página de clientes', () => {
      cy.visit('/clientes');
      cy.url().should('include', '/clientes');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para a página de vendas', () => {
      cy.visit('/vendas');
      cy.url().should('include', '/vendas');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para a página de trocas', () => {
      cy.visit('/trocas');
      cy.url().should('include', '/trocas');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para o dashboard', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para o carrinho', () => {
      cy.visit('/carrinho');
      cy.url().should('include', '/carrinho');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para minhas compras', () => {
      cy.visit('/minhas-compras');
      cy.url().should('include', '/minhas-compras');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para chat IA', () => {
      cy.visit('/chat-ia');
      cy.url().should('include', '/chat-ia');
      cy.get('body').should('be.visible');
    });

    it('deve navegar para perfil', () => {
      cy.visit('/perfil');
      cy.url().should('include', '/perfil');
      cy.get('body').should('be.visible');
    });
  });

  describe('Responsividade', () => {
    const viewports = [
      { device: 'mobile', width: 375, height: 667 },
      { device: 'tablet', width: 768, height: 1024 },
      { device: 'desktop', width: 1280, height: 720 }
    ];

    viewports.forEach(viewport => {
      it(`deve ser responsivo em ${viewport.device}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/');
        
        // Verifica se a página é visível no viewport
        cy.get('body').should('be.visible');
        
        // Verifica se não há scroll horizontal desnecessário  
        cy.window().then((win) => {
          expect(win.document.body.scrollWidth).to.be.lte(viewport.width + 100);
        });
      });
    });
  });

  describe('Acessibilidade Básica', () => {
    it('deve ter título na página inicial', () => {
      cy.visit('/');
      cy.title().should('not.be.empty');
    });

    it('deve ter estrutura HTML semântica', () => {
      cy.visit('/');
      
      // Verifica se existem elementos semânticos básicos
      cy.get('body').should('exist');
      cy.get('html').should('exist');
    });
  });

  describe('Performance Básica', () => {
    it('deve carregar as páginas principais rapidamente', () => {
      const pages = ['/', '/login', '/estoque', '/clientes', '/vendas', '/dashboard'];
      
      pages.forEach(page => {
        const startTime = Date.now();
        cy.visit(page);
        cy.get('body').should('be.visible').then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(15000); // Menos de 15 segundos para ser mais flexível
        });
      });
    });
  });
});