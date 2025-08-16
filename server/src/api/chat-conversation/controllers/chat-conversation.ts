/**
 * chat-conversation controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::chat-conversation.chat-conversation', ({ strapi }) => ({
  async sendMessage(ctx) {
    try {
      const { message, conversationId } = ctx.request.body;
      
      // Buscar o client associado ao user
      const user = ctx.state.user;
      const client = await strapi.entityService.findMany('api::client.client', {
        filters: {
          user: {
            id: user.id
          }
        }
      });
      
      const clientId = client?.[0]?.id;

      if (!clientId) {
        return ctx.badRequest('Cliente não autenticado');
      }

      if (!message || message.trim().length === 0) {
        return ctx.badRequest('Mensagem não pode estar vazia');
      }

      // Use the service from operation to handle chat logic
      const operationService = strapi.service('api::operation.operation');
      const result = await operationService.sendChatMessage(clientId, message.trim(), conversationId);

      return ctx.send(result);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return ctx.internalServerError(error.message || 'Erro interno do servidor');
    }
  },

  async getHistory(ctx) {
    try {
      // Buscar o client associado ao user
      const user = ctx.state.user;
      const client = await strapi.entityService.findMany('api::client.client', {
        filters: {
          user: {
            id: user.id
          }
        }
      });
      
      const clientId = client?.[0]?.id;
      const { conversationId } = ctx.params;

      if (!clientId) {
        return ctx.badRequest('Cliente não autenticado');
      }

      const operationService = strapi.service('api::operation.operation');
      const result = await operationService.getConversationHistory(clientId, conversationId ? parseInt(conversationId) : undefined);

      return ctx.send(result);
    } catch (error) {
      console.error('Error in getHistory:', error);
      return ctx.internalServerError(error.message || 'Erro interno do servidor');
    }
  }
}));