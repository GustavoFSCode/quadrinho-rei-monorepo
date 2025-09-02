/**
 * Service de Notificações - RNF0046
 * Sistema completo de notificações para clientes e administradores
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'purchase' | 'trade' | 'promotion' | 'cart' | 'system';
  recipientType: 'client' | 'admin' | 'manager' | 'broadcast';
  recipientId?: string;
  recipientEmail?: string;
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationTemplate {
  id: string;
  key: string;
  title: string;
  messageTemplate: string;
  type: NotificationData['type'];
  isActive: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  priority: NotificationData['priority'];
}

export interface NotificationStats {
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  byType: Record<string, { count: number; readRate: number }>;
  byPriority: Record<string, { count: number; readRate: number }>;
  recentActivity: Array<{
    date: string;
    sent: number;
    read: number;
  }>;
}

export class NotificationService {

  private templates: Record<string, NotificationTemplate> = {
    // Templates de compra
    'purchase_approved': {
      id: 'purchase_approved',
      key: 'purchase_approved',
      title: 'Compra Aprovada',
      messageTemplate: 'Sua compra #{orderNumber} foi aprovada e será processada em breve. Total: R$ {totalValue}',
      type: 'purchase',
      isActive: true,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      priority: 'high'
    },
    'purchase_shipped': {
      id: 'purchase_shipped',
      key: 'purchase_shipped',
      title: 'Pedido Enviado',
      messageTemplate: 'Seu pedido #{orderNumber} foi enviado! Código de rastreamento: {trackingCode}',
      type: 'purchase',
      isActive: true,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      priority: 'high'
    },
    'purchase_delivered': {
      id: 'purchase_delivered',
      key: 'purchase_delivered',
      title: 'Pedido Entregue',
      messageTemplate: 'Seu pedido #{orderNumber} foi entregue. Que tal avaliar os produtos?',
      type: 'purchase',
      isActive: true,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      priority: 'medium'
    },
    // Templates de troca
    'trade_approved': {
      id: 'trade_approved',
      key: 'trade_approved',
      title: 'Troca Aprovada',
      messageTemplate: 'Sua solicitação de troca foi aprovada. Cupom gerado: {couponCode} no valor de R$ {couponValue}',
      type: 'trade',
      isActive: true,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      priority: 'high'
    },
    'trade_rejected': {
      id: 'trade_rejected',
      key: 'trade_rejected',
      title: 'Troca Rejeitada',
      messageTemplate: 'Sua solicitação de troca foi rejeitada. Motivo: {reason}',
      type: 'trade',
      isActive: true,
      emailEnabled: true,
      pushEnabled: false,
      inAppEnabled: true,
      priority: 'medium'
    },
    // Templates de carrinho
    'cart_expiring': {
      id: 'cart_expiring',
      key: 'cart_expiring',
      title: 'Carrinho Expirando',
      messageTemplate: 'Seu carrinho expira em {minutes} minutos. Finalize sua compra para não perder os produtos!',
      type: 'cart',
      isActive: true,
      emailEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      priority: 'urgent'
    },
    'cart_expired': {
      id: 'cart_expired',
      key: 'cart_expired',
      title: 'Carrinho Expirado',
      messageTemplate: 'Alguns itens foram removidos do seu carrinho por indisponibilidade.',
      type: 'cart',
      isActive: true,
      emailEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      priority: 'medium'
    },
    // Templates promocionais
    'promotion_new': {
      id: 'promotion_new',
      key: 'promotion_new',
      title: 'Nova Promoção',
      messageTemplate: 'Nova promoção disponível: {promotionTitle}. Desconto de {discount}!',
      type: 'promotion',
      isActive: true,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      priority: 'medium'
    },
    'wishlist_promotion': {
      id: 'wishlist_promotion',
      key: 'wishlist_promotion',
      title: 'Produto da Wishlist em Promoção',
      messageTemplate: 'O produto "{productTitle}" da sua wishlist está com {discount}% de desconto!',
      type: 'promotion',
      isActive: true,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      priority: 'high'
    },
    // Templates do sistema
    'stock_low': {
      id: 'stock_low',
      key: 'stock_low',
      title: 'Estoque Baixo',
      messageTemplate: 'Produto "{productTitle}" com estoque baixo: apenas {stockQuantity} unidades restantes.',
      type: 'system',
      isActive: true,
      emailEnabled: true,
      pushEnabled: false,
      inAppEnabled: true,
      priority: 'medium'
    }
  };

  /**
   * RNF0046 - Enviar notificação
   */
  public async sendNotification(
    templateKey: string,
    recipientType: NotificationData['recipientType'],
    recipientId: string,
    templateData: Record<string, any> = {},
    options: {
      scheduledFor?: Date;
      expiresAt?: Date;
      actionUrl?: string;
      actionLabel?: string;
      priority?: NotificationData['priority'];
      forceChannels?: ('email' | 'push' | 'inApp')[];
    } = {}
  ): Promise<NotificationData> {

    console.log(`[NOTIFICATION] Enviando notificação: ${templateKey} para ${recipientType}:${recipientId}`);

    try {
      const template = this.templates[templateKey];
      if (!template) {
        throw new ApplicationError(`Template de notificação "${templateKey}" não encontrado`);
      }

      if (!template.isActive) {
        console.log(`[NOTIFICATION] Template ${templateKey} está inativo, ignorando`);
        throw new ApplicationError('Template de notificação inativo');
      }

      // Buscar dados do destinatário
      const recipient = await this.getRecipientData(recipientType, recipientId);
      if (!recipient) {
        throw new ApplicationError('Destinatário não encontrado');
      }

      // Processar template da mensagem
      const processedMessage = this.processTemplate(template.messageTemplate, templateData);
      const processedTitle = this.processTemplate(template.title, templateData);

      // Criar notificação
      const notification: NotificationData = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title: processedTitle,
        message: processedMessage,
        type: template.type,
        recipientType,
        recipientId,
        recipientEmail: recipient.email,
        isRead: false,
        isArchived: false,
        priority: options.priority || template.priority,
        metadata: {
          templateKey,
          templateData,
          originalRecipient: recipient
        },
        scheduledFor: options.scheduledFor,
        expiresAt: options.expiresAt,
        createdAt: new Date(),
        actionUrl: options.actionUrl,
        actionLabel: options.actionLabel
      };

      // Salvar no banco usando audit-log como storage
      const savedNotification = await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation: 'CREATE',
          entityName: 'notification',
          entityId: notification.id,
          userId: recipientType === 'client' ? parseInt(recipientId) : null,
          userEmail: recipient.email,
          oldData: null,
          newData: {
            notificationType: 'NOTIFICATION',
            ...notification
          } as any,
          changedFields: ['notification.sent'],
          timestamp: notification.createdAt,
          ipAddress: 'system',
          userAgent: 'notification-service'
        }
      });

      // Enviar pelos canais habilitados
      const forceChannels = options.forceChannels;
      const channels = {
        email: forceChannels?.includes('email') || template.emailEnabled,
        push: forceChannels?.includes('push') || template.pushEnabled,
        inApp: forceChannels?.includes('inApp') || template.inAppEnabled
      };

      await this.deliverNotification(notification, channels);

      console.log(`[NOTIFICATION] Notificação enviada com sucesso: ${notification.id}`);
      return notification;

    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao enviar notificação:`, error);
      throw error;
    }
  }

  /**
   * Marcar notificação como lida
   */
  public async markAsRead(notificationId: string, userId?: string): Promise<void> {
    try {
      const notification = await this.findNotificationById(notificationId);
      if (!notification) {
        throw new ApplicationError('Notificação não encontrada');
      }

      if (notification.isRead) {
        return; // Já está marcada como lida
      }

      // Validar se usuário pode marcar como lida
      if (userId && notification.recipientId !== userId) {
        throw new ApplicationError('Usuário não tem permissão para marcar esta notificação');
      }

      // Atualizar notificação
      const notificationData = notification.metadata;
      await strapi.entityService.update('api::audit-log.audit-log', notification.auditLogId, {
        data: {
          newData: {
            ...notificationData,
            isRead: true,
            readAt: new Date().toISOString()
          } as any
        }
      });

      console.log(`[NOTIFICATION] Notificação marcada como lida: ${notificationId}`);

    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao marcar notificação como lida:`, error);
      throw error;
    }
  }

  /**
   * Buscar notificações do usuário
   */
  public async getUserNotifications(
    recipientType: NotificationData['recipientType'],
    recipientId: string,
    filters: {
      isRead?: boolean;
      type?: NotificationData['type'];
      priority?: NotificationData['priority'];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    notifications: NotificationData[];
    total: number;
    unreadCount: number;
  }> {

    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'notification',
          userId: recipientType === 'client' ? parseInt(recipientId) : null
        },
        sort: ['timestamp:desc'],
        limit: filters.limit || 50,
        start: filters.offset || 0
      });

      const notifications: NotificationData[] = [];
      let unreadCount = 0;

      auditLogs.forEach((log: any) => {
        const notificationData = log.newData;
        if (notificationData?.notificationType === 'NOTIFICATION') {
          // Aplicar filtros
          if (filters.isRead !== undefined && notificationData.isRead !== filters.isRead) {
            return;
          }
          if (filters.type && notificationData.type !== filters.type) {
            return;
          }
          if (filters.priority && notificationData.priority !== filters.priority) {
            return;
          }

          notifications.push({
            ...notificationData,
            auditLogId: log.id
          });

          if (!notificationData.isRead) {
            unreadCount++;
          }
        }
      });

      return {
        notifications,
        total: notifications.length,
        unreadCount
      };

    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao buscar notificações do usuário:`, error);
      throw error;
    }
  }

  /**
   * Buscar todas as notificações (admin)
   */
  public async getAllNotifications(filters: {
    recipientType?: NotificationData['recipientType'];
    type?: NotificationData['type'];
    isRead?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const queryFilters: any = {
        entityName: 'notification'
      };

      if (filters.startDate || filters.endDate) {
        queryFilters.timestamp = {};
        if (filters.startDate) queryFilters.timestamp.$gte = filters.startDate;
        if (filters.endDate) queryFilters.timestamp.$lte = filters.endDate;
      }

      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: queryFilters,
        sort: ['timestamp:desc'],
        limit: filters.limit || 100,
        start: filters.offset || 0
      });

      const notifications: NotificationData[] = [];

      auditLogs.forEach((log: any) => {
        const notificationData = log.newData;
        if (notificationData?.notificationType === 'NOTIFICATION') {
          // Aplicar filtros adicionais
          if (filters.recipientType && notificationData.recipientType !== filters.recipientType) {
            return;
          }
          if (filters.type && notificationData.type !== filters.type) {
            return;
          }
          if (filters.isRead !== undefined && notificationData.isRead !== filters.isRead) {
            return;
          }

          notifications.push({
            ...notificationData,
            auditLogId: log.id
          });
        }
      });

      return {
        success: true,
        data: notifications,
        total: notifications.length
      };

    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao buscar todas as notificações:`, error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de notificações
   */
  public async getNotificationStats(period?: { startDate: Date; endDate: Date }): Promise<NotificationStats> {
    try {
      const filters: any = {
        entityName: 'notification'
      };

      if (period) {
        filters.timestamp = {
          $gte: period.startDate,
          $lte: period.endDate
        };
      }

      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters,
        sort: ['timestamp:desc']
      });

      const stats: NotificationStats = {
        totalSent: 0,
        totalRead: 0,
        totalUnread: 0,
        readRate: 0,
        byType: {},
        byPriority: {},
        recentActivity: []
      };

      const dailyActivity: Record<string, { sent: number; read: number }> = {};

      auditLogs.forEach((log: any) => {
        const notificationData = log.newData;
        if (notificationData?.notificationType === 'NOTIFICATION') {
          stats.totalSent++;

          const isRead = notificationData.isRead;
          if (isRead) {
            stats.totalRead++;
          } else {
            stats.totalUnread++;
          }

          // Stats por tipo
          const type = notificationData.type;
          if (!stats.byType[type]) {
            stats.byType[type] = { count: 0, readRate: 0 };
          }
          stats.byType[type].count++;

          // Stats por prioridade
          const priority = notificationData.priority;
          if (!stats.byPriority[priority]) {
            stats.byPriority[priority] = { count: 0, readRate: 0 };
          }
          stats.byPriority[priority].count++;

          // Atividade diária
          const date = new Date(log.timestamp).toISOString().split('T')[0];
          if (!dailyActivity[date]) {
            dailyActivity[date] = { sent: 0, read: 0 };
          }
          dailyActivity[date].sent++;
          if (isRead) {
            dailyActivity[date].read++;
          }
        }
      });

      // Calcular read rates
      stats.readRate = stats.totalSent > 0 ? (stats.totalRead / stats.totalSent) * 100 : 0;

      Object.keys(stats.byType).forEach(type => {
        const typeStats = stats.byType[type];
        typeStats.readRate = typeStats.count > 0 ? (stats.totalRead / stats.totalSent) * 100 : 0;
      });

      Object.keys(stats.byPriority).forEach(priority => {
        const priorityStats = stats.byPriority[priority];
        priorityStats.readRate = priorityStats.count > 0 ? (stats.totalRead / stats.totalSent) * 100 : 0;
      });

      // Atividade recente
      stats.recentActivity = Object.entries(dailyActivity)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 7)
        .map(([date, activity]) => ({
          date,
          sent: activity.sent,
          read: activity.read
        }));

      return stats;

    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao gerar estatísticas:`, error);
      throw error;
    }
  }

  /**
   * Arquivar múltiplas notificações
   */
  public async archiveNotifications(notificationIds: string[], userId?: string) {
    const results = {
      processed: 0,
      archived: 0,
      errors: 0,
      errorDetails: [] as string[]
    };

    for (const notificationId of notificationIds) {
      results.processed++;

      try {
        const notification = await this.findNotificationById(notificationId);
        if (!notification) {
          results.errors++;
          results.errorDetails.push(`Notificação ${notificationId} não encontrada`);
          continue;
        }

        // Validar permissão
        if (userId && notification.recipientId !== userId) {
          results.errors++;
          results.errorDetails.push(`Sem permissão para arquivar notificação ${notificationId}`);
          continue;
        }

        // Atualizar notificação
        const notificationData = notification.metadata;
        await strapi.entityService.update('api::audit-log.audit-log', notification.auditLogId, {
          data: {
            newData: {
              ...notificationData,
              isArchived: true,
              archivedAt: new Date().toISOString()
            } as any
          }
        });

        results.archived++;

      } catch (error: any) {
        results.errors++;
        results.errorDetails.push(`Erro ao arquivar ${notificationId}: ${error.message}`);
      }
    }

    console.log(`[NOTIFICATION] Arquivamento em lote - Processadas: ${results.processed}, Arquivadas: ${results.archived}, Erros: ${results.errors}`);
    return results;
  }

  /**
   * Buscar dados do destinatário
   */
  private async getRecipientData(recipientType: string, recipientId: string) {
    try {
      switch (recipientType) {
        case 'client':
          const client = await strapi.entityService.findOne('api::client.client', recipientId, {
            populate: {
              user: {
                fields: ['email', 'username']
              }
            }
          });
          return client ? {
            id: client.documentId,
            name: client.name,
            email: (client as any).user?.email,
            type: 'client'
          } : null;

        case 'admin':
        case 'manager':
          const user = await strapi.entityService.findOne('plugin::users-permissions.user', recipientId);
          return user ? {
            id: user.id,
            name: user.username,
            email: user.email,
            type: recipientType
          } : null;

        default:
          return null;
      }
    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao buscar dados do destinatário:`, error);
      return null;
    }
  }

  /**
   * Processar template de mensagem
   */
  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    return processed;
  }

  /**
   * Entregar notificação pelos canais
   */
  private async deliverNotification(
    notification: NotificationData,
    channels: { email: boolean; push: boolean; inApp: boolean }
  ) {
    try {
      // In-app sempre ativa (já salva no banco)
      if (channels.inApp) {
        console.log(`[NOTIFICATION] Notificação in-app criada: ${notification.id}`);
      }

      // Email (simulado por enquanto)
      if (channels.email && notification.recipientEmail) {
        await this.sendEmail(notification);
      }

      // Push (simulado por enquanto)
      if (channels.push) {
        await this.sendPushNotification(notification);
      }

    } catch (error) {
      console.error(`[NOTIFICATION] Erro na entrega:`, error);
      // Não falhar se entrega falhar
    }
  }

  /**
   * Enviar email (simulado)
   */
  private async sendEmail(notification: NotificationData) {
    try {
      console.log(`[NOTIFICATION] Email enviado para ${notification.recipientEmail}: ${notification.title}`);
      // Aqui seria integrado com serviço de email real (SendGrid, SES, etc.)
    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao enviar email:`, error);
    }
  }

  /**
   * Enviar push notification (simulado)
   */
  private async sendPushNotification(notification: NotificationData) {
    try {
      console.log(`[NOTIFICATION] Push notification enviada: ${notification.title}`);
      // Aqui seria integrado com serviço de push real (FCM, APNS, etc.)
    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao enviar push:`, error);
    }
  }

  /**
   * Buscar notificação por ID
   */
  private async findNotificationById(notificationId: string): Promise<(NotificationData & { auditLogId: string }) | null> {
    try {
      const auditLogs = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'notification'
        }
      });

      for (const log of auditLogs) {
        const notificationData = log.newData as any;
        if (notificationData?.notificationType === 'NOTIFICATION' && notificationData.id === notificationId) {
          return {
            ...notificationData,
            auditLogId: log.id.toString()
          };
        }
      }

      return null;

    } catch (error) {
      console.error(`[NOTIFICATION] Erro ao buscar notificação por ID:`, error);
      return null;
    }
  }

  /**
   * Limpar notificações antigas
   */
  public async cleanupExpiredNotifications(daysOld: number = 90) {
    console.log(`[NOTIFICATION] Limpando notificações antigas (${daysOld} dias)...`);

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const oldNotifications = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters: {
          entityName: 'notification',
          timestamp: {
            $lt: cutoffDate
          }
        }
      });

      let deleted = 0;

      for (const notification of oldNotifications) {
        const notificationData = notification.newData as any;
        
        // Só deletar se for arquivada ou lida há muito tempo
        if (notificationData?.isArchived || 
            (notificationData?.isRead && notificationData?.readAt && 
             new Date(notificationData.readAt) < cutoffDate)) {
          
          await strapi.entityService.delete('api::audit-log.audit-log', notification.id);
          deleted++;
        }
      }

      console.log(`[NOTIFICATION] Limpeza concluída - ${deleted} notificações removidas`);
      return { success: true, deleted, processed: oldNotifications.length };

    } catch (error) {
      console.error(`[NOTIFICATION] Erro na limpeza:`, error);
      throw error;
    }
  }
}