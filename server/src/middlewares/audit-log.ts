/**
 * Middleware de Auditoria - RNF0012
 * Registra todas as operações de escrita (CREATE, UPDATE, DELETE)
 * com data/hora/usuário e dados alterados
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();
    
    // Capturar dados antes da operação para UPDATE e DELETE
    let oldData = null;
    const method = ctx.request.method;
    const entityMatch = ctx.request.url.match(/\/api\/([^\/]+)/);
    
    if (!entityMatch) {
      return await next();
    }
    
    const entityName = entityMatch[1];
    
    // Entidades que devem ser auditadas
    const auditableEntities = [
      'products',
      'clients', 
      'purchases',
      'carts',
      'trades',
      'addresses',
      'cards',
      'coupons'
    ];
    
    if (!auditableEntities.includes(entityName)) {
      return await next();
    }
    
    // Para UPDATE e DELETE, capturar estado atual
    if ((method === 'PUT' || method === 'DELETE') && ctx.params.id) {
      try {
        const entityService = strapi.entityService;
        const contentType = `api::${entityName.slice(0, -1)}.${entityName.slice(0, -1)}`;
        
        oldData = await entityService.findOne(contentType, ctx.params.id, {
          populate: '*'
        });
      } catch (error) {
        console.log('Erro ao capturar dados antigos para auditoria:', error.message);
      }
    }
    
    // Executar a operação
    await next();
    
    // Só auditar operações bem-sucedidas (status 200-299)
    if (ctx.response.status < 200 || ctx.response.status >= 300) {
      return;
    }
    
    // Determinar tipo de operação
    let operation = null;
    if (method === 'POST') operation = 'CREATE';
    else if (method === 'PUT') operation = 'UPDATE';
    else if (method === 'DELETE') operation = 'DELETE';
    
    if (!operation) return;
    
    // Capturar dados do usuário
    const user = ctx.state.user;
    const userId = user?.id;
    const userEmail = user?.email;
    
    // Capturar dados da requisição
    const ipAddress = ctx.request.ip;
    const userAgent = ctx.request.header['user-agent'];
    
    // Capturar novos dados (para CREATE e UPDATE)
    let newData = null;
    let entityId = null;
    
    if (operation === 'CREATE') {
      newData = ctx.response.body?.data;
      entityId = newData?.id?.toString();
    } else if (operation === 'UPDATE') {
      newData = ctx.response.body?.data;
      entityId = ctx.params.id;
    } else if (operation === 'DELETE') {
      entityId = ctx.params.id;
    }
    
    // Calcular campos alterados para UPDATE
    let changedFields = null;
    if (operation === 'UPDATE' && oldData && newData) {
      changedFields = [];
      const oldAttrs = oldData.attributes || oldData;
      const newAttrs = newData.attributes || newData;
      
      for (const key in newAttrs) {
        if (JSON.stringify(oldAttrs[key]) !== JSON.stringify(newAttrs[key])) {
          changedFields.push({
            field: key,
            oldValue: oldAttrs[key],
            newValue: newAttrs[key]
          });
        }
      }
    }
    
    // Criar log de auditoria
    try {
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          operation,
          entityName,
          entityId,
          userId,
          userEmail,
          oldData: oldData ? (oldData.attributes || oldData) : null,
          newData: newData ? (newData.attributes || newData) : null,
          changedFields,
          timestamp: new Date(),
          ipAddress,
          userAgent
        }
      });
      
      console.log(`[AUDIT] ${operation} ${entityName} ${entityId} by user ${userId || 'anonymous'}`);
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error.message);
      // Não falhar a operação principal se a auditoria falhar
    }
  };
};