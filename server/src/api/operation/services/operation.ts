/**
 * operation service
 */

import { factories } from '@strapi/strapi';

interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface GeminiResponse {
  candidates: [{
    content: {
      parts: [{ text: string }];
    };
  }];
}

interface ProjectContext {
  products: any[];
  productCategories: any[];
  recentPurchases: any[];
  tradeStatuses: any[];
  userStats: {
    totalSpent: number;
    totalPurchases: number;
    totalCouponsUsed: number;
    totalProductsBought: number;
  };
}

export default factories.createCoreService('api::operation.operation', () => ({
  async sendChatMessage(clientId: number, message: string, conversationId?: number) {
    const ctx = strapi.requestContext.get();

    try {
      // Rate limiting - verificar se o cliente não está excedendo 15 mensagens por minuto
      const recentMessages = await strapi.entityService.findMany('api::chat-message.chat-message', {
        filters: {
          conversation: {
            client: {
              id: clientId
            }
          },
          createdAt: {
            $gte: new Date(Date.now() - 60000) // últimos 60 segundos
          }
        }
      });

      if (recentMessages.length >= 15) {
        throw new Error('Rate limit exceeded. Máximo 15 mensagens por minuto.');
      }

      // Buscar ou criar conversa
      let conversation;
      if (conversationId) {
        conversation = await strapi.entityService.findOne('api::chat-conversation.chat-conversation', conversationId, {
          populate: {
            messages: {
              sort: 'createdAt:asc'
            },
            client: true
          }
        });
      } else {
        // Criar nova conversa
        conversation = await strapi.entityService.create('api::chat-conversation.chat-conversation', {
          data: {
            client: clientId,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            active: true
          }
        });
      }

      // Salvar mensagem do usuário
      const userMessage = await strapi.entityService.create('api::chat-message.chat-message', {
        data: {
          conversation: conversation.id,
          content: message,
          sender: 'user',
          messageType: 'text'
        }
      });

      // Verificar se a pergunta está no escopo do projeto
      if (!this.isQuestionInScope(message)) {
        const scopeMessage = "Desculpe, só posso ajudar com questões relacionadas à Quadrinho Rei, como informações sobre produtos, pedidos, trocas ou funcionamento da loja. Como posso ajudá-lo com algo relacionado aos nossos quadrinhos?";
        
        const aiMessage = await strapi.entityService.create('api::chat-message.chat-message', {
          data: {
            conversation: conversation.id,
            content: scopeMessage,
            sender: 'ai',
            messageType: 'text'
          }
        });

        return {
          success: true,
          conversation: conversation.id,
          userMessage,
          aiMessage,
          response: scopeMessage
        };
      }

      // Buscar contexto do projeto
      const context = await this.getProjectContext(clientId);

      // Preparar histórico da conversa para o Gemini
      const conversationHistory: ChatMessage[] = [];
      
      if (conversation.messages) {
        conversation.messages.forEach(msg => {
          conversationHistory.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        });
      }

      // Adicionar mensagem atual com contexto das estatísticas do usuário
      const enhancedMessage = `${message}

DADOS DO USUÁRIO PARA REFERÊNCIA:
- Total gasto: R$ ${context.userStats.totalSpent.toFixed(2)}
- Pedidos realizados: ${context.userStats.totalPurchases}
- Quadrinhos comprados: ${context.userStats.totalProductsBought}
- Cupons utilizados: ${context.userStats.totalCouponsUsed}`;

      conversationHistory.push({
        role: 'user',
        parts: [{ text: enhancedMessage }]
      });

      // Log do contexto completo antes de chamar Gemini
      console.log('=== CONTEXT SENT TO GEMINI ===');
      console.log('User Stats:', JSON.stringify(context.userStats, null, 2));
      console.log('Products count:', context.products.length);
      console.log('Categories count:', context.productCategories.length);
      console.log('==============================');
      
      strapi.log.info('CONTEXT SENT TO GEMINI:', {
        userStats: context.userStats,
        productsCount: context.products.length,
        categoriesCount: context.productCategories.length
      });

      // Chamar API do Gemini
      const aiResponse = await this.callGeminiAPI(conversationHistory, context);
      
      // Salvar resposta da IA
      const aiMessage = await strapi.entityService.create('api::chat-message.chat-message', {
        data: {
          conversation: conversation.id,
          content: aiResponse,
          sender: 'ai',
          messageType: 'text'
        }
      });

      return {
        success: true,
        conversation: conversation.id,
        userMessage,
        aiMessage,
        response: aiResponse
      };

    } catch (error) {
      strapi.log.error('Chat service error:', error);
      
      // Salvar mensagem de erro se a conversa existe
      let errorMessage;
      if (conversationId) {
        errorMessage = await strapi.entityService.create('api::chat-message.chat-message', {
          data: {
            conversation: conversationId,
            content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.',
            sender: 'ai',
            messageType: 'text',
            isError: true
          }
        });
      }

      throw {
        success: false,
        error: error.message || 'Erro interno do servidor',
        errorMessage
      };
    }
  },

  async getConversationHistory(clientId: number, conversationId?: number) {
    const filters: any = {
      client: clientId,
      active: true
    };

    if (conversationId) {
      filters.id = conversationId;
    }

    const conversations = await strapi.entityService.findMany('api::chat-conversation.chat-conversation', {
      filters,
      populate: {
        messages: {
          sort: 'createdAt:asc'
        }
      },
      sort: 'updatedAt:desc'
    });

    return conversations;
  },

  isQuestionInScope(message: string): boolean {
    const keywords = [
      // Produtos e quadrinhos
      'quadrinho', 'comic', 'hq', 'produto', 'livro', 'autor', 'editora', 'preço', 'estoque',
      'marvel', 'dc', 'manga', 'anime', 'herói', 'super', 'batman', 'superman', 'spider',
      'disponível', 'comprar', 'vender',
      
      // E-commerce
      'pedido', 'compra', 'carrinho', 'pagamento', 'entrega', 'frete', 'envio',
      'status', 'rastreamento', 'cancelar', 'devolver',
      
      // Loja
      'loja', 'funcionamento', 'horário', 'localização', 'contato', 'telefone',
      'troca', 'desconto', 'promoção', 'cupom',
      
      // Conta/perfil
      'conta', 'perfil', 'login', 'senha', 'cadastro', 'endereço', 'cartão',
      
      // Perguntas sobre dados pessoais do usuário
      'quanto', 'quantos', 'meus', 'minha', 'minhas', 'já', 'gastei', 'comprei', 'utilizei',
      'total', 'valor', 'gasto', 'pedidos', 'cupons', 'histórico', 'estatísticas',
      'fiz', 'realizei', 'usei', 'consumi',
      
      // Cumprimentos e conversação básica
      'olá', 'oi', 'hello', 'hey', 'e aí', 'tudo bem', 'como vai', 'bom dia', 'boa tarde', 'boa noite',
      'está aí', 'você está', 'alfred', 'assistente', 'virtual',
      
      // Geral
      'ajuda', 'dúvida', 'problema', 'suporte', 'atendimento'
    ];

    const messageWords = message.toLowerCase().split(/\s+/);
    return keywords.some(keyword => 
      messageWords.some(word => word.includes(keyword) || keyword.includes(word))
    );
  },

  async getProjectContext(clientId: number): Promise<ProjectContext> {
    try {
      // Buscar produtos em destaque (mais vendidos/recentes)
      const products = await strapi.entityService.findMany('api::product.product', {
        filters: { active: true },
        populate: ['productCategories'],
        limit: 20,
        sort: 'createdAt:desc'
      });

      // Buscar categorias
      const productCategories = await strapi.entityService.findMany('api::product-category.product-category', {
        limit: 10
      });

      // Buscar compras recentes do cliente (sem dados sensíveis)
      const recentPurchases = await strapi.entityService.findMany('api::purchase.purchase', {
        filters: { client: { id: clientId } },
        populate: ['purchaseSalesStatus'],
        limit: 5,
        sort: 'createdAt:desc'
      });

      // Buscar status de trocas
      const tradeStatuses = await strapi.entityService.findMany('api::trade-status.trade-status', {
        limit: 10
      });

      // Calcular estatísticas pessoais do usuário
      const userStats = await this.calculateUserStats(clientId);

      return {
        products: (products || []).map(p => ({
          id: p.id,
          title: p.title || 'Título não disponível',
          author: p.author || 'Autor desconhecido',
          publisher: p.publisher || 'Editora desconhecida',
          year: p.year || '',
          priceSell: p.priceSell || 0,
          stock: p.stock || 0,
          categories: (p as any).productCategories?.map((c: any) => c.name) || []
        })),
        productCategories: (productCategories || []).map(c => ({
          id: c.id,
          name: c.name || 'Categoria sem nome'
        })),
        recentPurchases: (recentPurchases || []).map(p => ({
          id: p.id,
          status: (p as any).purchaseSalesStatus?.name || 'Processando',
          createdAt: p.createdAt
        })),
        tradeStatuses: (tradeStatuses || []).map(s => ({
          id: s.id,
          name: s.name || 'Status desconhecido'
        })),
        userStats
      };
    } catch (error) {
      strapi.log.error('Error getting project context:', error);
      // Retornar contexto mínimo em caso de erro
      const userStats = await this.calculateUserStats(clientId);
      
      return {
        products: [],
        productCategories: [],
        recentPurchases: [],
        tradeStatuses: [],
        userStats
      };
    }
  },

  async calculateUserStats(clientId: number) {
    try {
      strapi.log.info(`Calculating stats for clientId: ${clientId}`);

      // Buscar compras finalizadas usando o campo correto
      const purchases = await strapi.documents('api::purchase.purchase').findMany({
        filters: { 
          client: { id: clientId },
          purchaseSalesStatus: {
            name: { $eq: 'Entregue' }
          }
        },
        populate: {
          cartOrders: {
            populate: {
              product: true
            }
          },
          coupons: true  // Relação correta para cupons
        }
      });

      strapi.log.info(`Found ${purchases.length} purchases for client ${clientId}`);

      if (!purchases || purchases.length === 0) {
        strapi.log.info(`No purchases found for clientId: ${clientId}`);
        return {
          totalSpent: 0,
          totalPurchases: 0,
          totalCouponsUsed: 0,
          totalProductsBought: 0
        };
      }

      // Calcular estatísticas básicas primeiro
      let totalSpent = 0;
      let totalProductsBought = 0;

      purchases.forEach((purchase: any, index: number) => {
        strapi.log.info(`Processing purchase ${index + 1}: ${purchase.id}`);
        
        // Somar valor dos produtos comprados
        if (purchase.cartOrders && Array.isArray(purchase.cartOrders)) {
          strapi.log.info(`Found ${purchase.cartOrders.length} cart orders`);
          
          purchase.cartOrders.forEach((order: any, orderIndex: number) => {
            strapi.log.info(`Processing order ${orderIndex + 1}:`, {
              quantity: order.quantity,
              quantityRefund: order.quantityRefund,
              product: order.product ? 'exists' : 'missing'
            });
            
            if (order.product && order.product.priceSell) {
              const quantity = (order.quantity || 0) - (order.quantityRefund || 0);
              const price = parseFloat(order.product.priceSell);
              const orderTotal = quantity * price;
              
              totalSpent += orderTotal;
              totalProductsBought += quantity;
              
              strapi.log.info(`Order ${orderIndex + 1}: ${quantity} x ${price} = ${orderTotal}`);
            } else {
              strapi.log.info(`Order ${orderIndex + 1}: Missing product or price`);
            }
          });
        } else {
          strapi.log.info(`Purchase ${index + 1}: No cartOrders found`);
        }
      });

      // Contar cupons utilizados
      let totalCouponsUsed = 0;
      purchases.forEach((purchase: any) => {
        if (purchase.coupons && Array.isArray(purchase.coupons)) {
          totalCouponsUsed += purchase.coupons.length;
          strapi.log.info(`Purchase ${purchase.id}: Found ${purchase.coupons.length} coupons`);
        }
      });

      const stats = {
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalPurchases: purchases.length,
        totalCouponsUsed,
        totalProductsBought
      };

      console.log(`=== FINAL STATS FOR CLIENT ${clientId} ===`);
      console.log(JSON.stringify(stats, null, 2));
      console.log(`STATS SUMMARY - Client ${clientId}: Spent=R$${stats.totalSpent}, Purchases=${stats.totalPurchases}, Products=${stats.totalProductsBought}`);
      console.log('========================================');
      
      strapi.log.info(`Final stats for client ${clientId}:`, JSON.stringify(stats, null, 2));
      strapi.log.info(`STATS SUMMARY - Client ${clientId}: Spent=R$${stats.totalSpent}, Purchases=${stats.totalPurchases}, Products=${stats.totalProductsBought}`);
      return stats;

    } catch (error) {
      strapi.log.error('Error calculating user stats:', error);
      return {
        totalSpent: 0,
        totalPurchases: 0,
        totalCouponsUsed: 0,
        totalProductsBought: 0
      };
    }
  },

  async callGeminiAPI(messages: ChatMessage[], context: ProjectContext): Promise<string> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log('=== GEMINI API CHECK ===');
    console.log('API Key configured:', GEMINI_API_KEY ? 'YES' : 'NO');
    console.log('API Key value:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NONE');
    console.log('Is default key:', GEMINI_API_KEY === 'your_gemini_api_key_here');
    console.log('========================');

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('GEMINI_API_KEY not configured, using mock response');
      // Return mock response for testing
      const lastMessage = messages[messages.length - 1];
      return `Olá! Esta é uma resposta de teste do chat-IA da Quadrinho Rei. Você disse: "${lastMessage.parts[0].text}". Para ativar as respostas reais da IA, configure uma chave válida do Gemini API no arquivo .env conforme descrito no CLAUDE.md.`;
    }

    const systemPrompt = this.buildSystemPrompt(context);
    
    console.log('=== SYSTEM PROMPT BEING SENT TO GEMINI ===');
    console.log('Prompt includes user stats:', systemPrompt.includes(`R$ ${context.userStats.totalSpent.toFixed(2)}`));
    console.log('Stats values in prompt:');
    console.log(`- totalSpent: ${context.userStats.totalSpent}`);
    console.log(`- totalPurchases: ${context.userStats.totalPurchases}`);
    console.log(`- totalProductsBought: ${context.userStats.totalProductsBought}`);
    console.log('==========================================');
    
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...messages
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.8,
        topK: 10
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('=== PAYLOAD BEING SENT TO GEMINI ===');
    console.log('System prompt starts with:', payload.contents[0].parts[0].text.substring(0, 200) + '...');
    console.log('Last user message:', payload.contents[payload.contents.length - 1].parts[0].text);
    console.log('Total contents in payload:', payload.contents.length);
    console.log('====================================');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      strapi.log.error('Gemini API error:', errorText);
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data: any = await response.json();
    
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      throw new Error('Nenhuma resposta gerada pela IA');
    }

    return data.candidates[0].content.parts[0].text;
  },

  buildSystemPrompt(context: ProjectContext): string {
    const prompt = `Você é o Alfred, assistente virtual da "Quadrinho Rei", uma loja online especializada em quadrinhos e HQs. 

INSTRUÇÕES IMPORTANTES:
- Responda APENAS sobre assuntos relacionados à loja, produtos, pedidos, trocas e quadrinhos em geral
- Se perguntarem sobre outros assuntos, educadamente redirecione para tópicos da loja
- Seja amigável, útil e conhecedor do universo dos quadrinhos
- Use linguagem brasileira informal mas profissional
- Não invente informações que não estão no contexto fornecido
- Quando perguntarem sobre dados pessoais do usuário, use as estatísticas fornecidas no contexto

CONTEXTO DA LOJA:
Produtos disponíveis: ${context.products.slice(0, 10).map(p => `${p.title} (${p.author}, ${p.publisher}) - R$ ${p.priceSell}`).join(', ')}

Categorias: ${context.productCategories.map(c => c.name).join(', ')}

Status de pedidos possíveis: ${context.tradeStatuses.map(s => s.name).join(', ')}

ESTATÍSTICAS PESSOAIS DO USUÁRIO:
- Total gasto em quadrinhos: R$ ${context.userStats.totalSpent.toFixed(2)}
- Número total de pedidos realizados: ${context.userStats.totalPurchases}
- Cupons já utilizados: ${context.userStats.totalCouponsUsed}
- Total de quadrinhos comprados: ${context.userStats.totalProductsBought}

A loja oferece:
- Venda de quadrinhos nacionais e importados
- Sistema de trocas de quadrinhos usados
- Entregas para todo o Brasil
- Suporte completo ao cliente

COMO RESPONDER PERGUNTAS ESPECÍFICAS DO USUÁRIO:
- "Quanto eu já gastei?" → Use o valor total gasto: R$ ${context.userStats.totalSpent.toFixed(2)}
- "Quantos pedidos eu fiz?" → Use o número de pedidos: ${context.userStats.totalPurchases}
- "Quantos cupons eu usei?" → Use o número de cupons: ${context.userStats.totalCouponsUsed}
- "Quantos quadrinhos eu comprei?" → Use o total de produtos: ${context.userStats.totalProductsBought}

Responda sempre de forma útil e direcionada aos produtos e serviços da Quadrinho Rei.`;

    console.log('=== SYSTEM PROMPT USER STATS ===');
    console.log(`Total Spent: R$ ${context.userStats.totalSpent.toFixed(2)}`);
    console.log(`Total Purchases: ${context.userStats.totalPurchases}`);
    console.log(`Total Products: ${context.userStats.totalProductsBought}`);
    console.log(`Total Coupons: ${context.userStats.totalCouponsUsed}`);
    console.log('=================================');
    
    strapi.log.info('Generated system prompt with user stats:', {
      totalSpent: context.userStats.totalSpent,
      totalPurchases: context.userStats.totalPurchases,
      totalProductsBought: context.userStats.totalProductsBought,
      totalCouponsUsed: context.userStats.totalCouponsUsed
    });

    return prompt;
  }
}));
