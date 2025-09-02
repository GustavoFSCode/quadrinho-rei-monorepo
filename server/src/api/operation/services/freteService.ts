/**
 * Service de Cálculo de Frete - RF0034
 * Calcula frete baseado em CEP, peso e dimensões dos produtos
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export class FreteService {
  
  // Tabela de frete por região (simulação - em produção usar API dos Correios)
  private freteTable = {
    'sudeste': { base: 15.00, perKg: 2.50 },
    'sul': { base: 18.00, perKg: 3.00 },
    'nordeste': { base: 25.00, perKg: 4.00 },
    'norte': { base: 30.00, perKg: 5.00 },
    'centro-oeste': { base: 22.00, perKg: 3.50 }
  };

  // Mapeamento de estados para regiões
  private estadoRegiao = {
    'SP': 'sudeste', 'RJ': 'sudeste', 'MG': 'sudeste', 'ES': 'sudeste',
    'PR': 'sul', 'SC': 'sul', 'RS': 'sul',
    'BA': 'nordeste', 'SE': 'nordeste', 'AL': 'nordeste', 'PE': 'nordeste',
    'PB': 'nordeste', 'RN': 'nordeste', 'CE': 'nordeste', 'PI': 'nordeste', 'MA': 'nordeste',
    'AM': 'norte', 'RR': 'norte', 'AP': 'norte', 'PA': 'norte', 'TO': 'norte', 'RO': 'norte', 'AC': 'norte',
    'MT': 'centro-oeste', 'MS': 'centro-oeste', 'GO': 'centro-oeste', 'DF': 'centro-oeste'
  };

  /**
   * Calcula frete para uma lista de produtos e endereço de entrega
   */
  public async calcularFrete(produtos: any[], enderecoEntrega: any) {
    try {
      if (!produtos || produtos.length === 0) {
        throw new ApplicationError('Lista de produtos é obrigatória');
      }

      if (!enderecoEntrega || !enderecoEntrega.state || !enderecoEntrega.cep) {
        throw new ApplicationError('Endereço de entrega com estado e CEP é obrigatório');
      }

      // Calcular peso e dimensões totais
      const totais = await this.calcularPesoEDimensoes(produtos);
      
      // Determinar região baseada no estado
      const regiao = this.estadoRegiao[enderecoEntrega.state.toUpperCase()];
      if (!regiao) {
        throw new ApplicationError('Estado não reconhecido para cálculo de frete');
      }

      // Calcular valor do frete
      const tabelaFrete = this.freteTable[regiao];
      const valorBase = tabelaFrete.base;
      const valorPorPeso = totais.pesoTotal * tabelaFrete.perKg;
      
      // Taxa adicional por dimensão (se muito grande)
      let taxaDimensao = 0;
      if (totais.volume > 50000) { // cm³
        taxaDimensao = 10.00;
      }

      const valorTotal = valorBase + valorPorPeso + taxaDimensao;
      
      // Prazo estimado de entrega (dias úteis)
      const prazoEntrega = this.calcularPrazoEntrega(regiao);

      return {
        valorFrete: parseFloat(valorTotal.toFixed(2)),
        prazoEntrega,
        regiao,
        pesoTotal: totais.pesoTotal,
        volume: totais.volume,
        detalhes: {
          valorBase,
          valorPorPeso,
          taxaDimensao
        }
      };

    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      throw error;
    }
  }

  /**
   * Calcula peso e dimensões totais dos produtos
   */
  private async calcularPesoEDimensoes(produtos: any[]) {
    let pesoTotal = 0;
    let volumeTotal = 0;

    for (const item of produtos) {
      // Se o item tem quantity (do carrinho)
      const quantidade = item.quantity || 1;
      
      // Buscar dados do produto se necessário
      let produto = item;
      if (item.product) {
        produto = item.product;
      } else if (item.productId || item.product_id) {
        produto = await strapi.entityService.findOne('api::product.product', 
          item.productId || item.product_id);
      }

      if (produto) {
        // Peso em gramas -> kg
        const peso = (produto.weight || 200) / 1000; // peso padrão: 200g
        pesoTotal += peso * quantidade;

        // Dimensões em mm -> cm³
        const altura = (produto.height || 20) / 10;
        const largura = (produto.length || 15) / 10;
        const profundidade = (produto.depth || 2) / 10;
        const volume = altura * largura * profundidade;
        volumeTotal += volume * quantidade;
      }
    }

    return {
      pesoTotal: Math.max(pesoTotal, 0.1), // mínimo 100g
      volume: volumeTotal
    };
  }

  /**
   * Calcula prazo de entrega baseado na região
   */
  private calcularPrazoEntrega(regiao: string): number {
    const prazos = {
      'sudeste': 3,
      'sul': 5,
      'nordeste': 7,
      'norte': 10,
      'centro-oeste': 6
    };

    return prazos[regiao] || 7;
  }

  /**
   * Valida CEP (formato básico)
   */
  public validarCEP(cep: string): boolean {
    if (!cep) return false;
    
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Verifica se tem 8 dígitos
    return cepLimpo.length === 8;
  }

  /**
   * Simula consulta de CEP (em produção usar API ViaCEP)
   */
  public async consultarCEP(cep: string) {
    if (!this.validarCEP(cep)) {
      throw new ApplicationError('CEP inválido');
    }

    // Simulação - em produção fazer chamada para ViaCEP
    const cepLimpo = cep.replace(/\D/g, '');
    const estado = this.simularEstadoPorCEP(cepLimpo);
    
    return {
      cep: cepLimpo,
      estado,
      cidade: 'Cidade Exemplo',
      bairro: 'Bairro Exemplo',
      logradouro: 'Logradouro Exemplo'
    };
  }

  /**
   * Simula detecção de estado por CEP (primeiros 2 dígitos)
   */
  private simularEstadoPorCEP(cep: string): string {
    const prefixo = parseInt(cep.substring(0, 2));
    
    if (prefixo >= 1 && prefixo <= 19) return 'SP';
    if (prefixo >= 20 && prefixo <= 28) return 'RJ';
    if (prefixo >= 30 && prefixo <= 39) return 'MG';
    if (prefixo >= 29 && prefixo <= 29) return 'ES';
    if (prefixo >= 80 && prefixo <= 87) return 'PR';
    if (prefixo >= 88 && prefixo <= 89) return 'SC';
    if (prefixo >= 90 && prefixo <= 99) return 'RS';
    
    return 'SP'; // padrão
  }
}