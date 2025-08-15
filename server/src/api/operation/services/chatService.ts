import { factories } from "@strapi/strapi";

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
}

export default factories.createCoreService("api::operation.operation", () => ({
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
              sort: 'createdAt:asc',
              limit: 20
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

      // Adicionar mensagem atual
      conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
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
      
      // Geral
      'ajuda', 'dúvida', 'problema', 'suporte', 'atendimento'
    ];

    const messageWords = message.toLowerCase().split(/\s+/);
    return keywords.some(keyword => 
      messageWords.some(word => word.includes(keyword) || keyword.includes(word))
    );
  },

  async getProjectContext(clientId: number): Promise<ProjectContext> {
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

    return {
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        author: p.author,
        publisher: p.publisher,
        year: p.year,
        priceSell: p.priceSell,
        stock: p.stock,
        categories: (p as any).productCategories?.map((c: any) => c.name) || []
      })),
      productCategories: productCategories.map(c => ({
        id: c.id,
        name: c.name
      })),
      recentPurchases: recentPurchases.map(p => ({
        id: p.id,
        status: (p as any).purchaseSalesStatus?.name || 'Processando',
        createdAt: p.createdAt
      })),
      tradeStatuses: tradeStatuses.map(s => ({
        id: s.id,
        name: s.name
      }))
    };
  },

  async callGeminiAPI(messages: ChatMessage[], context: ProjectContext): Promise<string> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const systemPrompt = this.buildSystemPrompt(context);
    
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
    return `Você é um assistente virtual da "Quadrinho Rei", uma loja online especializada em quadrinhos e HQs. 

INSTRUÇÕES IMPORTANTES:
- Responda APENAS sobre assuntos relacionados à loja, produtos, pedidos, trocas e quadrinhos em geral
- Se perguntarem sobre outros assuntos, educadamente redirecione para tópicos da loja
- Seja amigável, útil e conhecedor do universo dos quadrinhos
- Use linguagem brasileira informal mas profissional
- Não invente informações que não estão no contexto fornecido

CONTEXTO DA LOJA:
Produtos disponíveis: ${context.products.slice(0, 10).map(p => `${p.title} (${p.author}, ${p.publisher}) - R$ ${p.priceSell}`).join(', ')}

Categorias: ${context.productCategories.map(c => c.name).join(', ')}

Status de pedidos possíveis: ${context.tradeStatuses.map(s => s.name).join(', ')}

A loja oferece:
- Venda de quadrinhos nacionais e importados
- Sistema de trocas de quadrinhos usados
- Entregas para todo o Brasil
- Suporte completo ao cliente

Responda sempre de forma útil e direcionada aos produtos e serviços da Quadrinho Rei.`;
  }
}));