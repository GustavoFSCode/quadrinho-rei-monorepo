/**
 * Lifecycle hooks for Purchase entity
 * Automatically triggers ranking recalculation when purchase status changes to APROVADA
 */

import { ClientRankingService } from '../../../operation/services/clientRankingService';

export default {
  /**
   * Hook executado após atualização de uma compra
   * Detecta mudança de status para APROVADA e recalcula ranking ordinal
   */
  async afterUpdate(event: any) {
    const { result, params } = event;

    try {
      // Verificar se houve mudança para status APROVADA
      const newStatus = result?.purchaseStatus;
      const oldStatus = params?.data?.purchaseStatus;

      console.log('[PURCHASE LIFECYCLE] Purchase updated:', {
        purchaseId: result?.documentId,
        oldStatus,
        newStatus
      });

      // Se o status mudou para APROVADA, recalcular ranking ordinal
      if (newStatus === 'APROVADA' && oldStatus !== 'APROVADA') {
        console.log('[PURCHASE LIFECYCLE] Status changed to APROVADA - Triggering ordinal ranking recalculation...');

        const rankingService = new ClientRankingService();

        // Recalcular ranking ordinal de todos os clientes
        const recalcResult = await rankingService.calculateOrdinalRanking();

        console.log('[PURCHASE LIFECYCLE] ✅ Ordinal ranking recalculated:', recalcResult);
      }

    } catch (error) {
      console.error('[PURCHASE LIFECYCLE] Error in afterUpdate hook:', error);
      // Não bloquear a atualização da compra mesmo se o ranking falhar
    }
  }
};
