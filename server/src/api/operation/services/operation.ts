/**
 * operation service
 */

import { factories } from '@strapi/strapi';
import { GoogleGenAI } from '@google/genai';

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
  userPreferences?: any[];
  positiveFeedback?: number;
  negativeFeedback?: number;
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

      // Extrair preferências do usuário da mensagem
      try {
        await this.extractUserPreferences(clientId, message, conversation.id);
      } catch (prefError) {
        strapi.log.error('Error extracting preferences:', prefError);
        // Não falhar o chat se a extração de preferências falhar
      }

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

      // Detectar se o usuário está pedindo recomendações
      const recommendationKeywords = [
        'recomendar', 'recomenda', 'recomende', 'recomendação', 'recomendações',
        'sugerir', 'sugere', 'sugestão', 'sugestões',
        'indicar', 'indica', 'indicação', 'indicações',
        'o que comprar', 'o que você recomenda', 'me ajuda a escolher',
        'qual quadrinho', 'quais quadrinhos', 'que hq', 'qual hq'
      ];

      const lowerMessage = message.toLowerCase();
      const isAskingForRecommendations = recommendationKeywords.some(keyword =>
        lowerMessage.includes(keyword)
      );

      let recommendedProductsText = '';
      if (isAskingForRecommendations) {
        strapi.log.info('User is asking for recommendations, generating...');
        try {
          const recommendations = await this.generateProductRecommendations(clientId, 5);

          if (recommendations && recommendations.length > 0) {
            recommendedProductsText = '\n\nPRODUTOS RECOMENDADOS COM BASE NAS PREFERÊNCIAS DO USUÁRIO:\n';
            recommendations.forEach((product: any, index: number) => {
              recommendedProductsText += `${index + 1}. ${product.title} - ${product.author} (${product.publisher}, ${product.year || 'ano desconhecido'}) - R$ ${product.priceSell} - ${product.stock} em estoque\n`;
            });
            recommendedProductsText += '\nIMPORTANTE: Apresente esses produtos de forma natural e explicativa, destacando por que eles combinam com as preferências do usuário.';

            strapi.log.info(`Generated ${recommendations.length} recommendations for the user`);
          }
        } catch (recError) {
          strapi.log.error('Error generating recommendations:', recError);
        }
      }

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
- Cupons utilizados: ${context.userStats.totalCouponsUsed}${recommendedProductsText}`;

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

      // Buscar preferências do usuário
      const userPreferences = await strapi.entityService.findMany('api::user-preference.user-preference' as any, {
        filters: {
          client: { id: clientId }
        },
        sort: 'confidence_score:desc',
        limit: 10
      }) as any[];

      // Buscar feedback positivo e negativo do usuário
      const allMessages = await strapi.entityService.findMany('api::chat-message.chat-message', {
        filters: {
          conversation: {
            client: { id: clientId }
          },
          sender: 'ai',
          feedback: { $notNull: true }
        }
      });

      const positiveFeedback = allMessages.filter((m: any) => m.feedback === 'positive').length;
      const negativeFeedback = allMessages.filter((m: any) => m.feedback === 'negative').length;

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
        userStats,
        userPreferences: userPreferences || [],
        positiveFeedback,
        negativeFeedback
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
        userStats,
        userPreferences: [],
        positiveFeedback: 0,
        negativeFeedback: 0
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

  async extractUserPreferences(clientId: number, message: string, conversationId: number) {
    try {
      const lowerMessage = message.toLowerCase();
      const extractedPreferences: any[] = [];

      // 1. Extrair preferências de AUTORES
      const authorKeywords = ['gosto de', 'adoro', 'amo', 'curto', 'prefiro', 'favorito', 'fan de', 'fã de'];
      const authorPatterns = [
        /(?:gosto|adoro|amo|curto|prefiro|fan|fã)(?:\s+(?:de|do|da))?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:é|são)\s+(?:meu|minha|meus|minhas)\s+(?:autor|autora|favorito)/gi
      ];

      authorPatterns.forEach(pattern => {
        const matches = message.matchAll(pattern);
        for (const match of matches) {
          const author = match[1]?.trim();
          if (author && author.length > 2 && author.length < 50) {
            extractedPreferences.push({
              preference_type: 'author',
              preference_value: author,
              confidence_score: 0.8
            });
          }
        }
      });

      // 2. Extrair preferências de EDITORAS
      const publishers = ['Marvel', 'DC Comics', 'DC', 'Image Comics', 'Dark Horse', 'Panini', 'Abril', 'JBC'];
      publishers.forEach(publisher => {
        if (lowerMessage.includes(publisher.toLowerCase())) {
          const hasPreferenceKeyword = authorKeywords.some(keyword => lowerMessage.includes(keyword));
          if (hasPreferenceKeyword) {
            extractedPreferences.push({
              preference_type: 'publisher',
              preference_value: publisher,
              confidence_score: 0.7
            });
          }
        }
      });

      // 3. Extrair preferências de CATEGORIAS/GÊNEROS
      const categoryMappings = {
        'mangá': 'Mangá',
        'manga': 'Mangá',
        'super-herói': 'Super-Heróis',
        'super herói': 'Super-Heróis',
        'herói': 'Super-Heróis',
        'dc': 'DC Comics',
        'marvel': 'Marvel',
        'terror': 'Terror',
        'horror': 'Terror',
        'suspense': 'Suspense',
        'aventura': 'Aventura',
        'ficção': 'Ficção Científica',
        'sci-fi': 'Ficção Científica',
        'fantasia': 'Fantasia',
        'romance': 'Romance',
        'infantil': 'Infantil',
        'jovem': 'Young Adult'
      };

      Object.entries(categoryMappings).forEach(([keyword, category]) => {
        if (lowerMessage.includes(keyword)) {
          const hasPreferenceKeyword = authorKeywords.some(kw => lowerMessage.includes(kw)) ||
                                       lowerMessage.includes('só') ||
                                       lowerMessage.includes('apenas');
          if (hasPreferenceKeyword) {
            extractedPreferences.push({
              preference_type: 'category',
              preference_value: category,
              confidence_score: 0.75
            });
          }
        }
      });

      // 4. Extrair preferências de FAIXA DE PREÇO
      const pricePatterns = [
        /(?:até|no máximo|máximo de|gastaria até)\s+R?\$?\s*(\d+(?:,\d{2})?)/gi,
        /(?:entre|de)\s+R?\$?\s*(\d+(?:,\d{2})?)\s+(?:a|até|e)\s+R?\$?\s*(\d+(?:,\d{2})?)/gi,
        /(?:barato|mais barato|econômico|em conta)/gi
      ];

      pricePatterns.forEach((pattern, index) => {
        const matches = message.matchAll(pattern);
        for (const match of matches) {
          let priceRange = '';
          if (index === 0 && match[1]) {
            // "até X"
            priceRange = `0-${match[1].replace(',', '.')}`;
          } else if (index === 1 && match[1] && match[2]) {
            // "de X a Y"
            priceRange = `${match[1].replace(',', '.')}-${match[2].replace(',', '.')}`;
          } else if (index === 2) {
            // "barato"
            priceRange = '0-50';
          }

          if (priceRange) {
            extractedPreferences.push({
              preference_type: 'price_range',
              preference_value: priceRange,
              confidence_score: 0.6
            });
          }
        }
      });

      // 5. Extrair preferências de FAIXA DE ANO
      const yearPatterns = [
        /(?:anos?|década de)\s+(\d{4}|\d{2})/gi,
        /(?:clássicos?|antigos?|vintage)/gi,
        /(?:novos?|recentes?|lançamentos?)/gi
      ];

      yearPatterns.forEach((pattern, index) => {
        const matches = message.matchAll(pattern);
        for (const match of matches) {
          let yearRange = '';
          const currentYear = new Date().getFullYear();

          if (index === 0 && match[1]) {
            // "anos 90", "década de 2000"
            const year = match[1].length === 2 ? `19${match[1]}` : match[1];
            yearRange = `${year}-${parseInt(year) + 9}`;
          } else if (index === 1) {
            // "clássicos"
            yearRange = `1950-1999`;
          } else if (index === 2) {
            // "novos/recentes"
            yearRange = `${currentYear - 2}-${currentYear}`;
          }

          if (yearRange) {
            extractedPreferences.push({
              preference_type: 'year_range',
              preference_value: yearRange,
              confidence_score: 0.65
            });
          }
        }
      });

      // Salvar preferências extraídas no banco de dados
      for (const pref of extractedPreferences) {
        // Verificar se já existe uma preferência similar
        const existingPrefs = await strapi.entityService.findMany('api::user-preference.user-preference' as any, {
          filters: {
            client: { id: clientId },
            preference_type: pref.preference_type,
            preference_value: pref.preference_value
          }
        }) as any[];

        if (existingPrefs.length === 0) {
          // Criar nova preferência
          await strapi.entityService.create('api::user-preference.user-preference' as any, {
            data: {
              client: clientId,
              preference_type: pref.preference_type,
              preference_value: pref.preference_value,
              confidence_score: pref.confidence_score,
              extracted_from_conversation: conversationId
            }
          });

          strapi.log.info(`New preference extracted: ${pref.preference_type} = ${pref.preference_value}`);
        } else {
          // Atualizar confidence score se necessário
          const existing = existingPrefs[0];
          const newScore = Math.min(1, existing.confidence_score + 0.1);

          await strapi.entityService.update('api::user-preference.user-preference' as any, existing.id, {
            data: {
              confidence_score: newScore
            }
          });

          strapi.log.info(`Preference reinforced: ${pref.preference_type} = ${pref.preference_value} (score: ${newScore})`);
        }
      }

      return extractedPreferences;

    } catch (error) {
      strapi.log.error('Error extracting user preferences:', error);
      return [];
    }
  },

  async generateProductRecommendations(clientId: number, limit: number = 8) {
    try {
      // 1. Buscar preferências do usuário ordenadas por confidence score
      const preferences = await strapi.entityService.findMany('api::user-preference.user-preference' as any, {
        filters: {
          client: { id: clientId }
        },
        sort: 'confidence_score:desc'
      }) as any[];

      if (!preferences || preferences.length === 0) {
        strapi.log.info(`No preferences found for client ${clientId}, returning random popular products`);
        // Se não houver preferências, retornar produtos populares/recentes
        return await strapi.entityService.findMany('api::product.product', {
          filters: { active: true, stock: { $gt: 0 } },
          populate: ['productCategories'],
          limit,
          sort: 'createdAt:desc'
        });
      }

      strapi.log.info(`Found ${preferences.length} preferences for client ${clientId}`);

      // 2. Construir filtros baseados nas preferências
      const filterConditions: any = {
        active: true,
        stock: { $gt: 0 },
        $or: []
      };

      // Agrupar preferências por tipo
      const prefsByType: any = {
        author: [],
        publisher: [],
        category: [],
        price_range: [],
        year_range: []
      };

      preferences.forEach((pref: any) => {
        if (prefsByType[pref.preference_type]) {
          prefsByType[pref.preference_type].push(pref);
        }
      });

      // Adicionar filtros para autores
      if (prefsByType.author.length > 0) {
        prefsByType.author.forEach((pref: any) => {
          filterConditions.$or.push({
            author: { $containsi: pref.preference_value }
          });
        });
      }

      // Adicionar filtros para editoras
      if (prefsByType.publisher.length > 0) {
        prefsByType.publisher.forEach((pref: any) => {
          filterConditions.$or.push({
            publisher: { $containsi: pref.preference_value }
          });
        });
      }

      // Adicionar filtros para categorias
      if (prefsByType.category.length > 0) {
        prefsByType.category.forEach((pref: any) => {
          filterConditions.$or.push({
            productCategories: {
              name: { $containsi: pref.preference_value }
            }
          });
        });
      }

      // Adicionar filtros para faixa de preço
      if (prefsByType.price_range.length > 0) {
        const priceRanges = prefsByType.price_range.map((pref: any) => {
          const [min, max] = pref.preference_value.split('-').map(parseFloat);
          return { min, max };
        });

        // Usar a faixa de preço mais confiável
        const bestPriceRange = priceRanges[0];
        filterConditions.priceSell = {
          $gte: bestPriceRange.min,
          $lte: bestPriceRange.max
        };
      }

      // Adicionar filtros para faixa de ano
      if (prefsByType.year_range.length > 0) {
        const yearRanges = prefsByType.year_range.map((pref: any) => {
          const [min, max] = pref.preference_value.split('-').map(parseInt);
          return { min, max };
        });

        const bestYearRange = yearRanges[0];
        filterConditions.year = {
          $gte: bestYearRange.min,
          $lte: bestYearRange.max
        };
      }

      // Se não houver condições $or, remover o campo
      if (filterConditions.$or.length === 0) {
        delete filterConditions.$or;
      }

      strapi.log.info('Recommendation filters:', JSON.stringify(filterConditions, null, 2));

      // 3. Buscar produtos que matcham as preferências
      const recommendedProducts = await strapi.entityService.findMany('api::product.product', {
        filters: filterConditions,
        populate: ['productCategories'],
        limit: limit * 2, // Buscar mais para depois filtrar os melhores
        sort: ['stock:desc', 'createdAt:desc']
      });

      strapi.log.info(`Found ${recommendedProducts.length} products matching preferences`);

      // 4. Calcular score de relevância para cada produto
      const scoredProducts = recommendedProducts.map((product: any) => {
        let relevanceScore = 0;

        preferences.forEach((pref: any) => {
          const confidenceWeight = pref.confidence_score;

          switch (pref.preference_type) {
            case 'author':
              if (product.author?.toLowerCase().includes(pref.preference_value.toLowerCase())) {
                relevanceScore += 3 * confidenceWeight;
              }
              break;

            case 'publisher':
              if (product.publisher?.toLowerCase().includes(pref.preference_value.toLowerCase())) {
                relevanceScore += 2.5 * confidenceWeight;
              }
              break;

            case 'category':
              if (product.productCategories?.some((cat: any) =>
                  cat.name?.toLowerCase().includes(pref.preference_value.toLowerCase())
              )) {
                relevanceScore += 2 * confidenceWeight;
              }
              break;

            case 'price_range':
              const [minPrice, maxPrice] = pref.preference_value.split('-').map(parseFloat);
              if (product.priceSell >= minPrice && product.priceSell <= maxPrice) {
                relevanceScore += 1.5 * confidenceWeight;
              }
              break;

            case 'year_range':
              const [minYear, maxYear] = pref.preference_value.split('-').map(parseInt);
              if (product.year && product.year >= minYear && product.year <= maxYear) {
                relevanceScore += 1 * confidenceWeight;
              }
              break;
          }
        });

        // Bonus para produtos com estoque alto
        if (product.stock > 10) {
          relevanceScore += 0.5;
        }

        return {
          ...product,
          relevanceScore
        };
      });

      // 5. Ordenar por relevância e limitar ao número solicitado
      const topRecommendations = scoredProducts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      strapi.log.info(`Returning top ${topRecommendations.length} recommendations`);

      return topRecommendations.map(({ relevanceScore, ...product }) => product);

    } catch (error) {
      strapi.log.error('Error generating product recommendations:', error);
      // Em caso de erro, retornar produtos populares
      return await strapi.entityService.findMany('api::product.product', {
        filters: { active: true, stock: { $gt: 0 } },
        populate: ['productCategories'],
        limit,
        sort: 'createdAt:desc'
      });
    }
  },

  async callGeminiAPI(messages: ChatMessage[], context: ProjectContext): Promise<string> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

    try {
      // Inicializar o cliente do Google Gemini
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const systemPrompt = this.buildSystemPrompt(context);

      console.log('=== SYSTEM PROMPT BEING SENT TO GEMINI ===');
      console.log('Prompt includes user stats:', systemPrompt.includes(`R$ ${context.userStats.totalSpent.toFixed(2)}`));
      console.log('Stats values in prompt:');
      console.log(`- totalSpent: ${context.userStats.totalSpent}`);
      console.log(`- totalPurchases: ${context.userStats.totalPurchases}`);
      console.log(`- totalProductsBought: ${context.userStats.totalProductsBought}`);
      console.log('==========================================');

      // Construir o conteúdo completo da conversa
      const allContents = [
        {
          role: 'user' as const,
          parts: [{ text: systemPrompt }]
        },
        ...messages
      ];

      console.log('=== PAYLOAD BEING SENT TO GEMINI ===');
      console.log('System prompt starts with:', systemPrompt.substring(0, 200) + '...');
      console.log('Last user message:', messages[messages.length - 1]?.parts[0]?.text || 'N/A');
      console.log('Total messages in conversation:', messages.length);
      console.log('====================================');

      // Chamar a API usando a biblioteca oficial
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: allContents.map(content => ({
          role: content.role,
          parts: content.parts.map(part => ({ text: part.text }))
        })),
        config: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 10
        }
      });

      console.log('=== GEMINI RESPONSE RECEIVED ===');
      console.log('Response text length:', response.text?.length || 0);
      console.log('================================');

      if (!response.text) {
        throw new Error('Nenhuma resposta gerada pela IA');
      }

      return response.text;

    } catch (error: any) {
      console.log('=== GEMINI API ERROR DETAILS ===');
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
      console.log('================================');
      strapi.log.error('Gemini API error:', error);
      throw new Error(`Erro na API do Gemini: ${error.message}`);
    }
  },

  buildSystemPrompt(context: ProjectContext): string {
    // Construir seção de preferências do usuário
    let preferencesSection = '';
    if (context.userPreferences && context.userPreferences.length > 0) {
      const prefsByType: any = {
        author: [],
        publisher: [],
        category: [],
        price_range: [],
        year_range: [],
        genre: []
      };

      context.userPreferences.forEach((pref: any) => {
        if (prefsByType[pref.preference_type]) {
          prefsByType[pref.preference_type].push(pref.preference_value);
        }
      });

      preferencesSection = '\n\nPREFERÊNCIAS CONHECIDAS DO USUÁRIO:';

      if (prefsByType.author.length > 0) {
        preferencesSection += `\n- Autores favoritos: ${prefsByType.author.join(', ')}`;
      }
      if (prefsByType.publisher.length > 0) {
        preferencesSection += `\n- Editoras preferidas: ${prefsByType.publisher.join(', ')}`;
      }
      if (prefsByType.category.length > 0) {
        preferencesSection += `\n- Categorias de interesse: ${prefsByType.category.join(', ')}`;
      }
      if (prefsByType.price_range.length > 0) {
        preferencesSection += `\n- Faixa de preço: R$ ${prefsByType.price_range[0]}`;
      }
      if (prefsByType.year_range.length > 0) {
        preferencesSection += `\n- Período de interesse: ${prefsByType.year_range[0]}`;
      }

      preferencesSection += '\n\nIMPORTANTE: Use essas preferências ao fazer recomendações. Priorize produtos que se alinham com os gostos do usuário.';
    }

    // Construir seção de feedback
    let feedbackSection = '';
    if (context.positiveFeedback !== undefined && context.negativeFeedback !== undefined) {
      const totalFeedback = context.positiveFeedback + context.negativeFeedback;
      if (totalFeedback > 0) {
        const satisfactionRate = Math.round((context.positiveFeedback / totalFeedback) * 100);
        feedbackSection = `\n\nHISTÓRICO DE FEEDBACK:
- Respostas avaliadas positivamente: ${context.positiveFeedback}
- Respostas avaliadas negativamente: ${context.negativeFeedback}
- Taxa de satisfação: ${satisfactionRate}%
${context.negativeFeedback > context.positiveFeedback ? '\nATENÇÃO: O usuário tem dado mais feedback negativo. Seja mais claro, direto e útil nas respostas.' : ''}`;
      }
    }

    const prompt = `Você é o Alfred, assistente virtual da "Quadrinho Rei", uma loja online especializada em quadrinhos e HQs.

INSTRUÇÕES IMPORTANTES:
- Responda APENAS sobre assuntos relacionados à loja, produtos, pedidos, trocas e quadrinhos em geral
- Se perguntarem sobre outros assuntos, educadamente redirecione para tópicos da loja
- Seja amigável, útil e conhecedor do universo dos quadrinhos
- Use linguagem brasileira informal mas profissional
- Não invente informações que não estão no contexto fornecido
- Quando perguntarem sobre dados pessoais do usuário, use as estatísticas fornecidas no contexto
- Quando solicitado recomendações (palavras-chave: "recomendar", "sugerir", "o que comprar", "indicar"), use as preferências do usuário para personalizar as sugestões

CONTEXTO DA LOJA:
Produtos disponíveis: ${context.products.slice(0, 10).map(p => `${p.title} (${p.author}, ${p.publisher}) - R$ ${p.priceSell}`).join(', ')}

Categorias: ${context.productCategories.map(c => c.name).join(', ')}

Status de pedidos possíveis: ${context.tradeStatuses.map(s => s.name).join(', ')}

ESTATÍSTICAS PESSOAIS DO USUÁRIO:
- Total gasto em quadrinhos: R$ ${context.userStats.totalSpent.toFixed(2)}
- Número total de pedidos realizados: ${context.userStats.totalPurchases}
- Cupons já utilizados: ${context.userStats.totalCouponsUsed}
- Total de quadrinhos comprados: ${context.userStats.totalProductsBought}${preferencesSection}${feedbackSection}

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
- "O que você me recomenda?" → Use as preferências do usuário para sugerir produtos alinhados aos seus gostos

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
