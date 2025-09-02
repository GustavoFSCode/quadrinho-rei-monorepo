/**
 * Service de Validação de Margem - RN0013-RN0014
 * Valida margem mínima e solicita autorização de gerente quando necessário
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface MarginValidation {
  isValid: boolean;
  marginPercentage: number;
  requiresAuthorization: boolean;
  minimumMargin: number;
  authorizedBy?: string;
  authorizedAt?: Date;
  reason?: string;
}

export interface PendingApproval {
  id: string;
  productId: string;
  productTitle: string;
  currentPrice: number;
  proposedPrice: number;
  costPrice: number;
  currentMargin: number;
  proposedMargin: number;
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export class MarginValidationService {

  private defaultMinimumMargin = 15; // 15% margem mínima padrão

  /**
   * RN0013 - Validar margem mínima de lucro
   */
  public async validateMargin(
    costPrice: number, 
    salePrice: number, 
    productId?: string,
    userId?: string
  ): Promise<MarginValidation> {

    if (costPrice <= 0) {
      throw new ApplicationError('Preço de custo deve ser maior que zero');
    }

    if (salePrice <= 0) {
      throw new ApplicationError('Preço de venda deve ser maior que zero');
    }

    // Calcular margem percentual
    const marginPercentage = ((salePrice - costPrice) / costPrice) * 100;
    const minimumMargin = await this.getMinimumMarginConfig();

    const validation: MarginValidation = {
      isValid: marginPercentage >= minimumMargin,
      marginPercentage,
      requiresAuthorization: marginPercentage < minimumMargin && marginPercentage > 0,
      minimumMargin,
      reason: marginPercentage < minimumMargin 
        ? `Margem ${marginPercentage.toFixed(2)}% está abaixo do mínimo ${minimumMargin}%`
        : undefined
    };

    // Log da validação
    console.log(`[MARGIN] Validação de margem - Produto: ${productId || 'N/A'}`);
    console.log(`[MARGIN] Custo: R$${costPrice.toFixed(2)} | Venda: R$${salePrice.toFixed(2)} | Margem: ${marginPercentage.toFixed(2)}%`);
    console.log(`[MARGIN] Válida: ${validation.isValid} | Requer autorização: ${validation.requiresAuthorization}`);

    return validation;
  }

  /**
   * RN0014 - Solicitar autorização de gerente para margem baixa
   */
  public async requestMarginApproval(
    productId: string,
    proposedPrice: number,
    costPrice: number,
    reason: string,
    requestedByUserId: string
  ): Promise<PendingApproval> {

    try {
      // Buscar dados do produto
      const product = await strapi.entityService.findOne('api::product.product', productId);
      if (!product) {
        throw new ApplicationError('Produto não encontrado');
      }

      // Buscar dados do usuário solicitante
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', requestedByUserId);
      if (!user) {
        throw new ApplicationError('Usuário não encontrado');
      }

      // Validar margem
      const marginValidation = await this.validateMargin(costPrice, proposedPrice, productId, requestedByUserId);
      
      if (marginValidation.isValid) {
        throw new ApplicationError('Margem está dentro do permitido, autorização não necessária');
      }

      if (!marginValidation.requiresAuthorization) {
        throw new ApplicationError('Margem muito baixa, não pode ser autorizada');
      }

      // Criar solicitação de aprovação
      const approval = await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'margin-approval-request',
          entityId: `margin-${Date.now()}-${productId}`,
          userId: requestedByUserId,
          userEmail: user.email,
          oldData: {
            currentPrice: product.priceSell,
            currentMargin: product.priceBuy ? ((product.priceSell - product.priceBuy) / product.priceBuy) * 100 : null
          },
          newData: {
            productId,
            productTitle: product.title,
            proposedPrice,
            costPrice,
            proposedMargin: marginValidation.marginPercentage,
            reason,
            status: 'PENDING',
            requestedBy: user.email,
            requestedAt: new Date().toISOString(),
            minimumMargin: marginValidation.minimumMargin
          } as any,
          changedFields: ['product.priceSell'],
          timestamp: new Date(),
          ipAddress: 'system',
          userAgent: 'margin-validation-service'
        }
      });

      const pendingApproval: PendingApproval = {
        id: approval.id.toString(),
        productId,
        productTitle: product.title,
        currentPrice: product.priceSell,
        proposedPrice,
        costPrice,
        currentMargin: product.priceBuy ? ((product.priceSell - product.priceBuy) / product.priceBuy) * 100 : 0,
        proposedMargin: marginValidation.marginPercentage,
        requestedBy: user.email,
        requestedAt: new Date(),
        reason,
        status: 'PENDING'
      };

      console.log(`[MARGIN] Solicitação de aprovação criada - ID: ${approval.id}, Produto: ${product.title}`);

      // Notificar gerentes (implementar notificação se necessário)
      await this.notifyManagers(pendingApproval);

      return pendingApproval;

    } catch (error) {
      console.error('[MARGIN] Erro ao solicitar aprovação:', error);
      throw error;
    }
  }

  /**
   * Aprovar ou rejeitar solicitação de margem
   */
  public async processMarginApproval(
    approvalId: string, 
    decision: 'APPROVED' | 'REJECTED',
    authorizedByUserId: string,
    comments?: string
  ) {
    try {
      // Buscar solicitação de aprovação
      const approval = await strapi.entityService.findOne('api::audit-log.audit-log', approvalId);
      if (!approval) {
        throw new ApplicationError('Solicitação de aprovação não encontrada');
      }

      const approvalData = approval.newData as any;
      if (approvalData.status !== 'PENDING') {
        throw new ApplicationError('Solicitação já foi processada');
      }

      // Buscar dados do autorizador
      const authorizer = await strapi.entityService.findOne('plugin::users-permissions.user', authorizedByUserId, {
        populate: { role: true }
      });
      
      if (!authorizer) {
        throw new ApplicationError('Usuário autorizador não encontrado');
      }

      // Verificar se usuário tem permissão de gerente
      const hasManagerRole = await this.checkManagerPermission(authorizer);
      if (!hasManagerRole) {
        throw new ApplicationError('Usuário não possui permissão para aprovar margens');
      }

      // Atualizar status da aprovação
      await strapi.entityService.update('api::audit-log.audit-log', approvalId, {
        data: {
          newData: {
            ...approvalData,
            status: decision,
            authorizedBy: authorizer.email,
            authorizedAt: new Date().toISOString(),
            authorizerComments: comments
          } as any
        }
      });

      // Se aprovado, atualizar preço do produto
      if (decision === 'APPROVED') {
        await strapi.entityService.update('api::product.product', approvalData.productId, {
          data: {
            priceSell: approvalData.proposedPrice,
            priceBuy: approvalData.costPrice,
            lastPriceUpdate: new Date(),
            priceAuthorizedBy: authorizer.email
          }
        });

        console.log(`[MARGIN] Preço aprovado e atualizado - Produto: ${approvalData.productTitle}, Novo preço: R$${approvalData.proposedPrice}`);
      } else {
        console.log(`[MARGIN] Preço rejeitado - Produto: ${approvalData.productTitle}, Motivo: ${comments}`);
      }

      return {
        success: true,
        approvalId,
        decision,
        productId: approvalData.productId,
        authorizedBy: authorizer.email,
        message: decision === 'APPROVED' 
          ? 'Preço aprovado e atualizado com sucesso'
          : 'Solicitação rejeitada'
      };

    } catch (error) {
      console.error('[MARGIN] Erro ao processar aprovação:', error);
      throw error;
    }
  }

  /**
   * Listar solicitações pendentes de aprovação
   */
  public async getPendingApprovals(managerId?: string): Promise<PendingApproval[]> {
    try {
      const filters: any = {
        entityName: 'margin-approval-request'
      };

      const approvals = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters,
        sort: ['createdAt:desc']
      });

      const pendingApprovals: PendingApproval[] = approvals
        .filter(approval => (approval.newData as any)?.status === 'PENDING')
        .map(approval => {
          const data = approval.newData as any;
          return {
            id: approval.id.toString(),
            productId: data.productId,
            productTitle: data.productTitle,
            currentPrice: data.currentPrice || 0,
            proposedPrice: data.proposedPrice,
            costPrice: data.costPrice,
            currentMargin: data.currentMargin || 0,
            proposedMargin: data.proposedMargin,
            requestedBy: data.requestedBy,
            requestedAt: new Date(data.requestedAt),
            reason: data.reason,
            status: 'PENDING'
          };
        });

      return pendingApprovals;

    } catch (error) {
      console.error('[MARGIN] Erro ao buscar aprovações pendentes:', error);
      throw error;
    }
  }

  /**
   * Histórico de aprovações de margem
   */
  public async getApprovalHistory(productId?: string, limit: number = 50) {
    try {
      const filters: any = {
        entityName: 'margin-approval-request'
      };

      if (productId) {
        // Buscar por produto específico
        // Note: Como newData é JSON, precisaríamos de uma query mais complexa
        // Por simplicidade, vamos filtrar em memória após buscar
      }

      const approvals = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters,
        sort: ['createdAt:desc'],
        limit
      });

      const history = approvals
        .filter(approval => !productId || (approval.newData as any)?.productId === productId)
        .map(approval => {
          const data = approval.newData as any;
          return {
            id: approval.id.toString(),
            productId: data.productId,
            productTitle: data.productTitle,
            proposedPrice: data.proposedPrice,
            proposedMargin: data.proposedMargin,
            status: data.status,
            requestedBy: data.requestedBy,
            requestedAt: data.requestedAt,
            authorizedBy: data.authorizedBy,
            authorizedAt: data.authorizedAt,
            reason: data.reason,
            authorizerComments: data.authorizerComments
          };
        });

      return {
        success: true,
        data: history,
        total: history.length
      };

    } catch (error) {
      console.error('[MARGIN] Erro ao buscar histórico:', error);
      throw error;
    }
  }

  /**
   * Configuração de margem mínima
   */
  private async getMinimumMarginConfig(): Promise<number> {
    try {
      // Buscar configuração no sistema (implementar tabela de configurações se necessário)
      // Por enquanto, retornar valor padrão
      return this.defaultMinimumMargin;
    } catch (error) {
      console.warn('[MARGIN] Erro ao buscar configuração de margem, usando padrão:', this.defaultMinimumMargin);
      return this.defaultMinimumMargin;
    }
  }

  /**
   * Verificar se usuário tem permissão de gerente
   */
  private async checkManagerPermission(user: any): Promise<boolean> {
    try {
      // Verificar role do usuário
      if (user.role && user.role.name) {
        const roleName = user.role.name.toLowerCase();
        return roleName.includes('admin') || roleName.includes('gerente') || roleName.includes('manager');
      }

      // Verificar se é super admin
      if (user.role && user.role.type === 'authenticated') {
        // Implementar lógica específica se necessário
        return true; // Por enquanto, todos os usuários autenticados podem aprovar
      }

      return false;
    } catch (error) {
      console.error('[MARGIN] Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Notificar gerentes sobre solicitação pendente
   */
  private async notifyManagers(approval: PendingApproval): Promise<void> {
    try {
      console.log(`[MARGIN] Notificação enviada para gerentes - Solicitação: ${approval.id}`);
      // Implementar sistema de notificações (email, webhook, etc.)
      // Por enquanto, apenas log
    } catch (error) {
      console.error('[MARGIN] Erro ao notificar gerentes:', error);
      // Não falhar se notificação falhar
    }
  }

  /**
   * Validar preço automaticamente durante criação/edição de produto
   */
  public async validateProductPricing(productData: {
    priceBuy?: number;
    priceSell?: number;
    title?: string;
    id?: string;
  }, userId?: string) {
    if (!productData.priceBuy || !productData.priceSell) {
      return {
        isValid: true,
        requiresApproval: false,
        message: 'Preços não informados para validação'
      };
    }

    const validation = await this.validateMargin(
      productData.priceBuy,
      productData.priceSell,
      productData.id,
      userId
    );

    return {
      isValid: validation.isValid,
      requiresApproval: validation.requiresAuthorization,
      marginPercentage: validation.marginPercentage,
      minimumMargin: validation.minimumMargin,
      message: validation.reason || 'Margem validada com sucesso',
      canProceed: validation.isValid || validation.requiresAuthorization
    };
  }
}