/**
 * Service de Otimização de Cupons - RN0036
 * Otimiza o uso de cupons para minimizar troco desnecessário
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface CouponData {
  documentId: string;
  code: string;
  price: number;
  couponStatus: string;
  couponType?: string;
  tradeOrigin?: boolean;
}

export interface OptimizationResult {
  selectedCoupons: CouponData[];
  totalCouponValue: number;
  remainingAmount: number;
  changeAmount: number;
  needsChange: boolean;
  unusedCoupons: CouponData[];
  optimizationReason: string;
}

export class CouponOptimizationService {

  /**
   * RN0036 - Otimizar seleção de cupons para minimizar troco
   */
  public async optimizeCoupons(availableCoupons: string[], totalAmount: number): Promise<OptimizationResult> {
    console.log(`[COUPON_OPT] Otimizando cupons para valor total: R$${totalAmount.toFixed(2)}`);

    // 1. Buscar e validar todos os cupons
    const coupons = await this.fetchAndValidateCoupons(availableCoupons);
    
    if (coupons.length === 0) {
      throw new ApplicationError('Nenhum cupom válido encontrado');
    }

    // 2. Separar cupons promocionais e de troca
    const { promocionais, troca } = this.categorizeCoupons(coupons);

    // 3. Validar regra de apenas 1 cupom promocional
    if (promocionais.length > 1) {
      throw new ApplicationError('Apenas um cupom promocional pode ser usado por compra');
    }

    // 4. Encontrar combinação ótima
    const optimization = this.findOptimalCombination(coupons, totalAmount);

    console.log(`[COUPON_OPT] Combinação ótima: ${optimization.selectedCoupons.length} cupons, troco: R$${optimization.changeAmount.toFixed(2)}`);

    return optimization;
  }

  /**
   * Buscar e validar cupons
   */
  private async fetchAndValidateCoupons(couponIds: string[]): Promise<CouponData[]> {
    const validCoupons: CouponData[] = [];

    for (const couponId of couponIds) {
      try {
        const couponData = await strapi.documents('api::coupon.coupon').findOne({
          documentId: couponId
        });

        if (!couponData) {
          console.warn(`[COUPON_OPT] Cupom não encontrado: ${couponId}`);
          continue;
        }

        // Validar status
        // Cupons com status "EmUso" são válidos pois já foram aplicados à compra atual
        // Rejeitar apenas cupons com status "Usado" (já utilizados em compras finalizadas)
        const isValidStatus = couponData.couponStatus === 'NaoUsado' ||
                              couponData.couponStatus === 'EmUso';

        if (!isValidStatus) {
          console.warn(`[COUPON_OPT] Cupom inválido: ${couponData.code} - Status: ${couponData.couponStatus}`);
          continue;
        }

        // Validar valor
        if (!couponData.price || couponData.price <= 0) {
          console.warn(`[COUPON_OPT] Cupom sem valor: ${couponData.code}`);
          continue;
        }

        validCoupons.push({
          documentId: couponData.documentId,
          code: couponData.code,
          price: couponData.price,
          couponStatus: couponData.couponStatus,
          couponType: (couponData as any).couponType,
          tradeOrigin: (couponData as any).tradeOrigin
        });

      } catch (error) {
        console.error(`[COUPON_OPT] Erro ao buscar cupom ${couponId}:`, error);
        continue;
      }
    }

    return validCoupons;
  }

  /**
   * Categorizar cupons por tipo
   */
  private categorizeCoupons(coupons: CouponData[]) {
    const promocionais: CouponData[] = [];
    const troca: CouponData[] = [];

    for (const coupon of coupons) {
      // Apenas cupons explicitamente marcados como "Promocional" são promocionais
      // Todos os outros (Troca, Troco, null) são cupons de troca/desconto
      if (coupon.couponType === 'Promocional') {
        promocionais.push(coupon);
      } else {
        troca.push(coupon);
      }
    }

    return { promocionais, troca };
  }

  /**
   * Encontrar combinação ótima de cupons
   * Algoritmo: Subset Sum com otimização para minimizar troco
   */
  private findOptimalCombination(coupons: CouponData[], targetAmount: number): OptimizationResult {
    
    // Ordenar cupons por valor (maior primeiro)
    const sortedCoupons = [...coupons].sort((a, b) => b.price - a.price);

    // Tentar diferentes combinações para encontrar a ótima
    const solutions: OptimizationResult[] = [];

    // 1. Tentar combinação exata (sem troco)
    const exactMatch = this.findExactMatch(sortedCoupons, targetAmount);
    if (exactMatch) {
      solutions.push(exactMatch);
    }

    // 2. Tentar combinações com troco mínimo
    const withMinimalChange = this.findMinimalChangeCombination(sortedCoupons, targetAmount);
    if (withMinimalChange) {
      solutions.push(withMinimalChange);
    }

    // 3. Se não encontrou nenhuma, usar algoritmo guloso (maior cupom que cabe)
    if (solutions.length === 0) {
      const greedy = this.findGreedyCombination(sortedCoupons, targetAmount);
      solutions.push(greedy);
    }

    // Escolher a melhor solução (prioridade: sem troco > menor troco > mais cupons usados)
    const bestSolution = this.selectBestSolution(solutions);

    return {
      ...bestSolution,
      unusedCoupons: sortedCoupons.filter(c => 
        !bestSolution.selectedCoupons.find(s => s.documentId === c.documentId)
      )
    };
  }

  /**
   * Tentar encontrar combinação exata (soma = valor total)
   */
  private findExactMatch(coupons: CouponData[], targetAmount: number): OptimizationResult | null {
    // Usar programação dinâmica para subset sum exato
    const n = coupons.length;
    const target = Math.round(targetAmount * 100); // Trabalhar com centavos para evitar float

    // DP table: dp[i][j] = pode formar valor j usando primeiros i cupons
    const dp: boolean[][] = Array(n + 1).fill(null).map(() => Array(target + 1).fill(false));
    const parent: number[][] = Array(n + 1).fill(null).map(() => Array(target + 1).fill(-1));

    // Caso base
    for (let i = 0; i <= n; i++) {
      dp[i][0] = true;
    }

    // Preencher DP table
    for (let i = 1; i <= n; i++) {
      const couponValue = Math.round(coupons[i - 1].price * 100);
      
      for (let j = 0; j <= target; j++) {
        // Não usar o cupom atual
        dp[i][j] = dp[i - 1][j];
        
        // Usar o cupom atual (se possível)
        if (j >= couponValue && dp[i - 1][j - couponValue]) {
          dp[i][j] = true;
          parent[i][j] = i - 1; // Marcar que usou o cupom i-1
        }
      }
    }

    // Se encontrou solução exata
    if (dp[n][target]) {
      const selectedCoupons = this.backtrackSolution(parent, coupons, n, target);
      const totalValue = selectedCoupons.reduce((sum, c) => sum + c.price, 0);

      return {
        selectedCoupons,
        totalCouponValue: totalValue,
        remainingAmount: 0,
        changeAmount: 0,
        needsChange: false,
        unusedCoupons: [],
        optimizationReason: 'Combinação exata encontrada - sem troco'
      };
    }

    return null;
  }

  /**
   * Encontrar combinação com troco mínimo
   */
  private findMinimalChangeCombination(coupons: CouponData[], targetAmount: number): OptimizationResult | null {
    let bestCombination: CouponData[] = [];
    let minChange = Infinity;
    const maxCombinations = Math.min(Math.pow(2, coupons.length), 1000); // Limitar para performance

    // Tentar todas as combinações possíveis (força bruta otimizada)
    for (let mask = 1; mask < maxCombinations && mask < Math.pow(2, coupons.length); mask++) {
      const combination: CouponData[] = [];
      let totalValue = 0;
      let promocionalCount = 0;

      // Montar combinação baseada na máscara binária
      for (let i = 0; i < coupons.length; i++) {
        if (mask & (1 << i)) {
          combination.push(coupons[i]);
          totalValue += coupons[i].price;

          if (coupons[i].couponType === 'Promocional') {
            promocionalCount++;
          }
        }
      }

      // Pular se viola regra de cupom promocional
      if (promocionalCount > 1) continue;

      // Calcular troco
      const change = totalValue - targetAmount;
      
      // Só considerar se cobre o valor total
      if (change >= 0 && change < minChange) {
        minChange = change;
        bestCombination = [...combination];
        
        // Se encontrou sem troco, é ótimo
        if (change === 0) break;
      }
    }

    if (bestCombination.length > 0) {
      const totalValue = bestCombination.reduce((sum, c) => sum + c.price, 0);
      
      return {
        selectedCoupons: bestCombination,
        totalCouponValue: totalValue,
        remainingAmount: targetAmount - totalValue,
        changeAmount: Math.max(0, totalValue - targetAmount),
        needsChange: totalValue > targetAmount,
        unusedCoupons: [],
        optimizationReason: minChange === 0 
          ? 'Combinação exata por força bruta'
          : `Combinação com troco mínimo: R$${minChange.toFixed(2)}`
      };
    }

    return null;
  }

  /**
   * Algoritmo guloso - usar maior cupom que cabe
   */
  private findGreedyCombination(coupons: CouponData[], targetAmount: number): OptimizationResult {
    const selectedCoupons: CouponData[] = [];
    let remainingAmount = targetAmount;
    let promocionalUsed = false;

    for (const coupon of coupons) {
      // Verificar regra de cupom promocional
      const isPromocional = coupon.couponType === 'Promocional';
      if (isPromocional && promocionalUsed) continue;

      // Se o cupom cabe no valor restante
      if (coupon.price <= remainingAmount) {
        selectedCoupons.push(coupon);
        remainingAmount -= coupon.price;

        if (isPromocional) {
          promocionalUsed = true;
        }

        // Se cobriu exatamente, parar
        if (remainingAmount === 0) break;
      }
    }

    const totalValue = selectedCoupons.reduce((sum, c) => sum + c.price, 0);

    return {
      selectedCoupons,
      totalCouponValue: totalValue,
      remainingAmount: Math.max(0, targetAmount - totalValue),
      changeAmount: 0,
      needsChange: false,
      unusedCoupons: [],
      optimizationReason: 'Algoritmo guloso - cupons maiores primeiro'
    };
  }

  /**
   * Reconstruir solução do backtrack
   */
  private backtrackSolution(parent: number[][], coupons: CouponData[], i: number, j: number): CouponData[] {
    if (i === 0 || j === 0) return [];
    
    if (parent[i][j] !== -1) {
      // Usado o cupom parent[i][j]
      const couponIndex = parent[i][j];
      const couponValue = Math.round(coupons[couponIndex].price * 100);
      return [...this.backtrackSolution(parent, coupons, i - 1, j - couponValue), coupons[couponIndex]];
    } else {
      // Não usado o cupom atual
      return this.backtrackSolution(parent, coupons, i - 1, j);
    }
  }

  /**
   * Selecionar melhor solução entre as opções
   */
  private selectBestSolution(solutions: OptimizationResult[]): OptimizationResult {
    if (solutions.length === 0) {
      throw new ApplicationError('Nenhuma combinação de cupons válida encontrada');
    }

    // Ordenar por prioridade: sem troco > menor troco > mais cupons usados
    solutions.sort((a, b) => {
      // 1. Priorizar sem troco
      if (a.changeAmount === 0 && b.changeAmount > 0) return -1;
      if (b.changeAmount === 0 && a.changeAmount > 0) return 1;

      // 2. Menor troco
      if (a.changeAmount !== b.changeAmount) {
        return a.changeAmount - b.changeAmount;
      }

      // 3. Mais cupons usados
      return b.selectedCoupons.length - a.selectedCoupons.length;
    });

    return solutions[0];
  }

  /**
   * Validar e otimizar cupons para uma compra
   */
  public async validateAndOptimizeCoupons(couponIds: string[], totalAmount: number) {
    try {
      const optimization = await this.optimizeCoupons(couponIds, totalAmount);
      
      console.log(`[COUPON_OPT] Otimização concluída:`);
      console.log(`  - Cupons selecionados: ${optimization.selectedCoupons.length}`);
      console.log(`  - Valor total dos cupons: R$${optimization.totalCouponValue.toFixed(2)}`);
      console.log(`  - Troco necessário: R$${optimization.changeAmount.toFixed(2)}`);
      console.log(`  - Motivo: ${optimization.optimizationReason}`);

      return {
        success: true,
        optimization,
        message: optimization.needsChange
          ? `Cupons otimizados com troco de R$${optimization.changeAmount.toFixed(2)}`
          : 'Cupons otimizados sem necessidade de troco'
      };

    } catch (error) {
      console.error('[COUPON_OPT] Erro na otimização:', error);
      throw error;
    }
  }
}