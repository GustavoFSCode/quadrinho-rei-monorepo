import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Register custom chat routes
    strapi.server.routes([
      {
        method: 'POST',
        path: '/api/sendChatMessage',
        handler: async (ctx) => {
          try {
            console.log('sendChatMessage handler called');
            const { message, conversationId } = ctx.request.body;
            
            // Manual JWT validation
            const token = ctx.request.header.authorization?.replace('Bearer ', '');
            if (!token) {
              return ctx.unauthorized('Token de acesso necessário');
            }

            let user;
            try {
              const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(token);
              user = await strapi.entityService.findOne('plugin::users-permissions.user', decoded.id);
              if (!user) {
                return ctx.unauthorized('Usuário não encontrado');
              }
            } catch (error) {
              return ctx.unauthorized('Token inválido ou expirado');
            }

            // Find client associated with authenticated user
            const client = await strapi.entityService.findMany('api::client.client', {
              filters: {
                user: {
                  id: user.id
                }
              }
            });
            
            const clientId = client?.[0]?.id;

            if (!clientId) {
              return ctx.badRequest('Cliente não encontrado para este usuário');
            }

            if (!message || message.trim().length === 0) {
              return ctx.badRequest('Mensagem não pode estar vazia');
            }

            const operationService = strapi.service('api::operation.operation');
            const result = await operationService.sendChatMessage(clientId, message.trim(), conversationId);

            return ctx.send(result);
          } catch (error) {
            console.error('Error in sendChatMessage:', error);
            return ctx.internalServerError(error.message || 'Erro interno do servidor');
          }
        },
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/api/getChatHistory/:conversationId?',
        handler: async (ctx) => {
          try {
            console.log('getChatHistory handler called');
            
            // Manual JWT validation
            const token = ctx.request.header.authorization?.replace('Bearer ', '');
            if (!token) {
              return ctx.unauthorized('Token de acesso necessário');
            }

            let user;
            try {
              const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(token);
              user = await strapi.entityService.findOne('plugin::users-permissions.user', decoded.id);
              if (!user) {
                return ctx.unauthorized('Usuário não encontrado');
              }
            } catch (error) {
              return ctx.unauthorized('Token inválido ou expirado');
            }

            // Find client associated with authenticated user
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
              return ctx.badRequest('Cliente não encontrado para este usuário');
            }

            const operationService = strapi.service('api::operation.operation');
            const result = await operationService.getConversationHistory(clientId, conversationId ? parseInt(conversationId) : undefined);

            return ctx.send(result);
          } catch (error) {
            console.error('Error in getChatHistory:', error);
            return ctx.internalServerError(error.message || 'Erro interno do servidor');
          }
        },
        config: {
          auth: false,
          policies: [],
        },
      }
    ]);
  },
};
