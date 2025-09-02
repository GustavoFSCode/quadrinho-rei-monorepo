/**
 * Service de Controle de Estoque - RF0053 e RF0054
 * Gerencia baixa automática de estoque e reentrada por trocas
 * RN0028 - Validação de status antes da baixa
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
import { StockValidationService } from './stockValidationService';

export class StockService {
  
  private stockValidationService: StockValidationService;

  constructor() {
    this.stockValidationService = new StockValidationService();
  }
  
  /**
   * Baixa estoque automaticamente quando compra é aprovada (RF0053)
   * RN0028 - Validação de status antes da baixa
   */
  public async baixarEstoquePorCompra(purchaseId: string) {
    try {
      console.log(`[STOCK] Iniciando baixa de estoque para compra ${purchaseId}`);

      // RN0028: Validar status da compra antes da baixa
      const statusValidation = await this.stockValidationService.validateStockOperationByPurchaseStatus(
        purchaseId, 
        'BAIXA'
      );

      if (!statusValidation.isValid) {
        console.warn(`[STOCK] ❌ Baixa de estoque bloqueada: ${statusValidation.message}`);
        throw new ApplicationError(`Baixa de estoque não autorizada: ${statusValidation.message}`);
      }

      console.log(`[STOCK] ✅ Status validado para baixa - ${statusValidation.currentStatus}`);

      // Buscar compra com produtos  
      const purchase = await strapi.entityService.findOne('api::purchase.purchase', purchaseId, {
        populate: {
          cartOrders: {
            populate: {
              product: true
            }
          }
        }
      }) as any;

      if (!purchase || !purchase.cartOrders) {
        throw new ApplicationError('Compra ou produtos não encontrados');
      }

      const operacoesEstoque = [];

      // Processar cada item da compra
      for (const cartOrder of purchase.cartOrders) {
        const produto = cartOrder.product;
        const quantidade = cartOrder.quantity;

        if (!produto || !quantidade) {
          console.log(`Produto ou quantidade inválida no cartOrder ${cartOrder.id}`);
          continue;
        }

        // Validar estoque do produto usando o service de validação
        const stockValidation = await this.stockValidationService.validateProductStock(
          produto.documentId || produto.id,
          quantidade,
          'BAIXA'
        );

        if (!stockValidation.isValid) {
          throw new ApplicationError(stockValidation.message);
        }

        // Calcular novo estoque
        const novoEstoque = produto.stock - quantidade;

        // Atualizar estoque do produto
        await strapi.entityService.update('api::product.product', produto.id, {
          data: {
            stock: novoEstoque
          }
        });

        operacoesEstoque.push({
          produtoId: produto.id,
          produtoTitulo: produto.title,
          estoqueAnterior: produto.stock,
          quantidadeBaixada: quantidade,
          novoEstoque: novoEstoque,
          operacao: 'BAIXA_VENDA'
        });

        console.log(`[STOCK] Baixa automática - Produto: ${produto.title}, Quantidade: ${quantidade}, Novo estoque: ${novoEstoque}`);
      }

      // Criar registro de movimentação de estoque
      await this.registrarMovimentacaoEstoque({
        tipo: 'BAIXA_VENDA',
        referencia: `COMPRA_${purchaseId}`,
        operacoes: operacoesEstoque,
        usuario: null // Sistema
      });

      return {
        success: true,
        operacoes: operacoesEstoque,
        message: `Baixa de estoque realizada para ${operacoesEstoque.length} produtos`
      };

    } catch (error) {
      console.error('Erro ao baixar estoque:', error);
      throw error;
    }
  }

  /**
   * Reentrada de estoque quando troca é confirmada (RF0054)
   */
  public async reentradaEstoquePorTroca(tradeId: string) {
    try {
      // Buscar troca com produto
      const trade = await strapi.entityService.findOne('api::trade.trade', tradeId, {
        populate: {
          cartOrder: {
            populate: {
              product: true
            }
          }
        }
      }) as any;

      if (!trade || !trade.cartOrder || !trade.cartOrder.product) {
        throw new ApplicationError('Troca ou produto não encontrado');
      }

      const produto = trade.cartOrder.product;
      const quantidade = trade.quantity;

      // Calcular novo estoque (reentrada)
      const novoEstoque = produto.stock + quantidade;

      // Atualizar estoque do produto
      await strapi.entityService.update('api::product.product', produto.id, {
        data: {
          stock: novoEstoque
        }
      });

      const operacao = {
        produtoId: produto.id,
        produtoTitulo: produto.title,
        estoqueAnterior: produto.stock,
        quantidadeReentrada: quantidade,
        novoEstoque: novoEstoque,
        operacao: 'REENTRADA_TROCA'
      };

      // Registrar movimentação
      await this.registrarMovimentacaoEstoque({
        tipo: 'REENTRADA_TROCA',
        referencia: `TROCA_${tradeId}`,
        operacoes: [operacao],
        usuario: null
      });

      console.log(`[STOCK] Reentrada por troca - Produto: ${produto.title}, Quantidade: ${quantidade}, Novo estoque: ${novoEstoque}`);

      return {
        success: true,
        operacao,
        message: `Reentrada de estoque realizada para produto ${produto.title}`
      };

    } catch (error) {
      console.error('Erro na reentrada de estoque:', error);
      throw error;
    }
  }

  /**
   * Valida estoque disponível antes da finalização da compra
   */
  public async validarEstoqueCarrinho(cartOrders: any[]) {
    const erros = [];
    
    for (const cartOrder of cartOrders) {
      const produto = cartOrder.product;
      const quantidade = cartOrder.quantity;

      if (!produto) {
        erros.push(`Produto não encontrado no item ${cartOrder.id}`);
        continue;
      }

      if (produto.stock < quantidade) {
        erros.push(`Produto "${produto.title}" tem estoque insuficiente. Disponível: ${produto.stock}, Solicitado: ${quantidade}`);
      }

      // Verificar se produto está ativo
      if (!produto.active) {
        erros.push(`Produto "${produto.title}" está inativo e não pode ser vendido`);
      }
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Registra movimentação de estoque para auditoria
   */
  private async registrarMovimentacaoEstoque(dados: any) {
    try {
      // Criar entidade de movimentação de estoque (se não existir, criar como JSON)
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'UPDATE',
          entityName: 'stock-movement',
          entityId: dados.referencia,
          userId: dados.usuario,
          userEmail: null,
          oldData: null,
          newData: dados,
          changedFields: null,
          timestamp: new Date(),
          ipAddress: 'system',
          userAgent: 'stock-service'
        }
      });

      console.log(`[AUDIT] Movimentação de estoque registrada: ${dados.tipo} - ${dados.referencia}`);
    } catch (error) {
      console.error('Erro ao registrar movimentação de estoque:', error);
      // Não falhar a operação principal se o log falhar
    }
  }

  /**
   * Reserva produtos no carrinho (para implementação futura de timeout)
   */
  public async reservarProdutos(cartOrders: any[], clienteId: string, timeoutMinutos = 15) {
    // Para implementação futura - reserva temporária de estoque
    console.log(`[STOCK] Reserva temporária de ${cartOrders.length} produtos para cliente ${clienteId} por ${timeoutMinutos} minutos`);
    
    return {
      success: true,
      expiresAt: new Date(Date.now() + timeoutMinutos * 60 * 1000),
      message: 'Produtos reservados temporariamente'
    };
  }

  /**
   * Libera reserva de produtos (quando carrinho expira ou é cancelado)
   */
  public async liberarReserva(cartOrders: any[]) {
    // Para implementação futura
    console.log(`[STOCK] Liberando reserva de ${cartOrders.length} produtos`);
    
    return {
      success: true,
      message: 'Reserva liberada'
    };
  }

  /**
   * Entrada manual de estoque (para reposição)
   */
  public async entradaEstoque(produtoId: string, quantidade: number, custo?: number, fornecedor?: string) {
    try {
      const produto = await strapi.entityService.findOne('api::product.product', produtoId);
      
      if (!produto) {
        throw new ApplicationError('Produto não encontrado');
      }

      const novoEstoque = produto.stock + quantidade;
      const dados: any = { stock: novoEstoque };

      // Se fornecido novo custo, atualizar preço de compra
      if (custo && custo > 0) {
        dados.priceBuy = custo;
      }

      await strapi.entityService.update('api::product.product', produtoId, {
        data: dados
      });

      // Registrar movimentação
      await this.registrarMovimentacaoEstoque({
        tipo: 'ENTRADA_MANUAL',
        referencia: `ENTRADA_${Date.now()}`,
        operacoes: [{
          produtoId,
          produtoTitulo: produto.title,
          estoqueAnterior: produto.stock,
          quantidadeEntrada: quantidade,
          novoEstoque,
          custo,
          fornecedor,
          operacao: 'ENTRADA_MANUAL'
        }],
        usuario: null
      });

      console.log(`[STOCK] Entrada manual - Produto: ${produto.title}, Quantidade: ${quantidade}, Novo estoque: ${novoEstoque}`);

      return {
        success: true,
        estoqueAnterior: produto.stock,
        novoEstoque,
        message: 'Entrada de estoque realizada com sucesso'
      };

    } catch (error) {
      console.error('Erro na entrada de estoque:', error);
      throw error;
    }
  }
}