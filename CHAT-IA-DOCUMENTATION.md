# Documentação Completa: Sistema Chat-IA (Alfred)

Sistema de Feedback (👍/👎)

  Como Funciona

  1. Coleta do Feedback
  - Usuário clica em 👍 (positive) ou 👎 (negative) em mensagens da IA
  - Feedback é salvo no banco de dados (chat_messages.feedback e feedback_timestamp)
  - Cada mensagem pode receber apenas 1 feedback (botões ficam desabilitados após avaliação)

  2. Armazenamento
  // Atualiza a mensagem com o feedback
  UPDATE chat_messages
  SET feedback = 'positive',
      feedback_timestamp = NOW()
  WHERE id = messageId;

  Impacto no Funcionamento

  1. Contexto para a IA (System Prompt)

  O feedback é agregado e incluído no prompt enviado ao Gemini:

  // Calcula estatísticas de feedback
  const positiveFeedback = 8;  // 8 mensagens com 👍
  const negativeFeedback = 2;  // 2 mensagens com 👎
  const satisfactionRate = 80%; // Taxa de satisfação

  // Adiciona ao System Prompt
  HISTÓRICO DE FEEDBACK:
  - Respostas avaliadas positivamente: 8
  - Respostas avaliadas negativamente: 2
  - Taxa de satisfação: 80%

  ATENÇÃO: O usuário tem dado mais feedback negativo.
           Seja mais claro, direto e útil nas respostas.

  2. Ajuste Comportamental da IA

  Se negativeFeedback > positiveFeedback:
  - System prompt adiciona alerta especial pedindo à IA para ser:
    - Mais clara
    - Mais direta
    - Mais útil
    - Menos prolixo

  3. Monitoramento de Qualidade

  O feedback permite aos administradores:
  - Identificar mensagens problemáticas (filtrar por feedback = 'negative')
  - Calcular taxa de satisfação geral do assistente
  - Detectar padrões de insatisfação

  Exemplo Prático

  Cenário 1: Feedback Positivo (80%)
  System Prompt:
  - Taxa de satisfação: 80%
  (Nenhum alerta especial)

  IA responde normalmente, mantendo o estilo amigável e detalhado.

  Cenário 2: Feedback Negativo (20% satisfação)
  System Prompt:
  - Taxa de satisfação: 20%
  ATENÇÃO: O usuário tem dado mais feedback negativo.
           Seja mais claro, direto e útil nas respostas.

  IA ajusta comportamento:
  - Respostas mais curtas
  - Menos "enrolação"
  - Foco em informações práticas
  - Tom mais objetivo

  Limitações Atuais

  O feedback NÃO faz:
  - ❌ Fine-tuning do modelo (não retreina o Gemini)
  - ❌ Ajuste em tempo real na conversa atual (só impacta próximas conversas)
  - ❌ Análise de qual parte da resposta foi ruim
  - ❌ Aprendizado de padrões específicos

  O feedback FAZ:
  - ✅ Informa a IA sobre satisfação geral do usuário
  - ✅ Ajusta "tom" através do System Prompt
  - ✅ Permite monitoramento de qualidade
  - ✅ Coleta dados para futuras melhorias

  Código Relevante

  Backend (operation.ts:344-356):
  // Busca feedback do usuário
  const allMessages = await findMessages({
    filters: {
      conversation: { client: { id: clientId } },
      sender: 'ai',
      feedback: { $notNull: true }
    }
  });

  const positiveFeedback = allMessages.filter(m => m.feedback === 'positive').length;
  const negativeFeedback = allMessages.filter(m => m.feedback === 'negative').length;

  // Inclui no contexto enviado ao Gemini
  context.positiveFeedback = positiveFeedback;
  context.negativeFeedback = negativeFeedback;

  System Prompt Builder (operation.ts:1019-1029):
  if (negativeFeedback > positiveFeedback) {
    feedbackSection += '\nATENÇÃO: O usuário tem dado mais feedback negativo.
                         Seja mais claro, direto e útil nas respostas.';
  }

  ---
  Em resumo: O feedback não "treina" a IA, mas influencia o comportamento através de instruções no System Prompt, pedindo à IA para ajustar seu estilo quando detecta insatisfação do usuário.

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Banco de Dados](#banco-de-dados)
5. [Backend (Strapi)](#backend-strapi)
6. [Frontend (Next.js)](#frontend-nextjs)
7. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
8. [Sistema de Recomendações](#sistema-de-recomendações)
9. [Configuração e Setup](#configuração-e-setup)
10. [Limitações e Controles](#limitações-e-controles)

---

## Visão Geral

O **Chat-IA (Alfred)** é um assistente virtual inteligente integrado ao e-commerce Quadrinho Rei. Ele utiliza a API do Google Gemini (modelo gemini-2.5-flash) para fornecer suporte personalizado aos clientes sobre produtos, pedidos, trocas e recomendações de quadrinhos.

### Características Principais
- ✅ **IA Conversacional**: Respostas contextuais usando Google Gemini
- ✅ **Histórico Persistente**: Todas as conversas são salvas no banco de dados
- ✅ **Recomendações Personalizadas**: Sistema inteligente baseado em preferências do usuário
- ✅ **Rate Limiting**: Proteção contra abuso (15 mensagens/minuto por usuário)
- ✅ **Feedback do Usuário**: Sistema de avaliação de respostas (👍/👎)
- ✅ **Extração de Preferências**: Análise automática de gostos do usuário
- ✅ **Scope Filtering**: Apenas responde questões relacionadas à loja
- ✅ **Gratuito**: Uso da API Gemini com 15 requisições/minuto grátis

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  (Next.js 14 - /client/src/app/chat-ia/page.tsx)           │
│                                                              │
│  • Interface de Chat com mensagens                          │
│  • Gerenciamento de estado (React Hooks)                    │
│  • Auto-scroll e indicador de digitação                     │
│  • Sistema de feedback                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (chatService.ts)
┌──────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Strapi 5)                        │
│  Controllers:                                                │
│  • /api/sendChatMessage (POST)                              │
│  • /api/getChatHistory/:conversationId? (GET)               │
│  • /api/chatMessageFeedback (POST)                          │
│                                                              │
│  Services (operation.ts):                                   │
│  • sendChatMessage() - Lógica principal do chat            │
│  • getConversationHistory() - Buscar histórico              │
│  • callGeminiAPI() - Integração com Gemini                 │
│  • generateProductRecommendations() - Sistema de recomendação│
│  • extractUserPreferences() - Extração de preferências      │
│  • calculateUserStats() - Estatísticas do usuário           │
│  • isQuestionInScope() - Validação de escopo                │
│  • buildSystemPrompt() - Construção do contexto para IA     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  GOOGLE GEMINI API                           │
│  Modelo: gemini-2.5-flash                                    │
│  • Temperature: 0.7                                          │
│  • Max Output Tokens: 1024                                   │
│  • Top P: 0.8                                                │
│  • Top K: 10                                                 │
└──────────────────────────────────────────────────────────────┘
                       ▲
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   BANCO DE DADOS                             │
│  PostgreSQL (via Strapi Entity Service)                     │
│  • chat_conversations                                        │
│  • chat_messages                                             │
│  • user_preferences                                          │
│  • clients, products, purchases (contexto)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológica

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Styling**: styled-components
- **State Management**: React Hooks (useState, useEffect, useRef)
- **HTTP Client**: Axios (via chatService.ts)
- **Notificações**: react-toastify

### Backend
- **CMS**: Strapi 5.10.0
- **Runtime**: Node.js
- **Database**: PostgreSQL 18
- **IA**: Google Gemini SDK (gemini-2.5-flash)

### Bibliotecas Principais
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.1.0",  // SDK Gemini
    "@strapi/strapi": "5.10.0",
    "axios": "latest",
    "react": "18.x",
    "next": "14.x"
  }
}
```

---

## Banco de Dados

### Estrutura de Entidades

#### 1. **chat_conversations**
```json
{
  "collectionName": "chat_conversations",
  "attributes": {
    "client": "relation (manyToOne) -> client",
    "messages": "relation (oneToMany) -> chat_message",
    "title": "string (default: 'Nova Conversa')",
    "active": "boolean (default: true)",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Propósito**: Agrupa mensagens em conversas. Cada cliente pode ter múltiplas conversas.

#### 2. **chat_messages**
```json
{
  "collectionName": "chat_messages",
  "attributes": {
    "conversation": "relation (manyToOne) -> chat_conversation",
    "content": "text (required)",
    "sender": "enum ['user', 'ai'] (required)",
    "messageType": "enum ['text', 'audio'] (default: 'text')",
    "isError": "boolean (default: false)",
    "feedback": "enum ['positive', 'negative'] (nullable)",
    "feedback_timestamp": "datetime (nullable)",
    "createdAt": "datetime"
  }
}
```

**Propósito**: Armazena cada mensagem individual da conversa (do usuário ou da IA).

#### 3. **user_preferences**
```json
{
  "collectionName": "user_preferences",
  "attributes": {
    "client": "relation (manyToOne) -> client",
    "preference_type": "enum ['author', 'publisher', 'category', 'year_range', 'price_range', 'genre']",
    "preference_value": "text (required)",
    "confidence_score": "decimal [0-1] (default: 0.5)",
    "extracted_from_conversation": "relation (manyToOne) -> chat_conversation",
    "createdAt": "datetime"
  }
}
```

**Propósito**: Armazena preferências extraídas automaticamente das conversas do usuário para personalização de recomendações.

### Relacionamentos
```
client
  └── 1:N → chat_conversations
       └── 1:N → chat_messages
  └── 1:N → user_preferences
  └── 1:N → purchases (contexto)
```

---

## Backend (Strapi)

### Estrutura de Arquivos
```
server/src/api/
├── chat-conversation/
│   ├── content-types/chat-conversation/schema.json
│   ├── controllers/chat-conversation.ts
│   └── routes/chat-conversation.ts
├── chat-message/
│   ├── content-types/chat-message/schema.json
│   └── controllers/chat-message.ts
├── user-preference/
│   └── content-types/user-preference/schema.json
└── operation/
    ├── controllers/operation.ts (endpoints principais)
    ├── services/operation.ts (lógica de negócio)
    └── routes/operation.ts
```

### Endpoints da API

#### 1. **POST /api/sendChatMessage**
**Arquivo**: `server/src/api/operation/controllers/operation.ts:249`

**Request Body**:
```typescript
{
  message: string;        // Mensagem do usuário
  conversationId?: number; // ID da conversa (opcional, cria nova se ausente)
}
```

**Response**:
```typescript
{
  success: boolean;
  conversation: number;    // ID da conversa
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  response: string;        // Resposta da IA
}
```

**Fluxo de Execução**:
1. Valida autenticação do usuário
2. Busca clientId associado ao user
3. Valida mensagem não vazia
4. Chama `operationService.sendChatMessage()`

#### 2. **GET /api/getChatHistory/:conversationId?**
**Arquivo**: `server/src/api/operation/controllers/operation.ts:283`

**Parâmetros**:
- `conversationId` (opcional): ID específico da conversa

**Response**:
```typescript
ChatConversation[] // Array de conversas com mensagens populadas
```

**Fluxo**:
1. Busca cliente autenticado
2. Filtra conversas ativas do cliente
3. Popula mensagens ordenadas por data
4. Ordena conversas por última atualização

#### 3. **POST /api/chatMessageFeedback**
**Arquivo**: `server/src/api/operation/controllers/operation.ts:311`

**Request Body**:
```typescript
{
  messageId: number;
  feedback: 'positive' | 'negative';
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  data: ChatMessage; // Mensagem atualizada com feedback
}
```

---

### Serviço Principal: `operation.ts`

#### Método: `sendChatMessage()`
**Arquivo**: `server/src/api/operation/services/operation.ts:38`

**Fluxo Completo**:

```typescript
async sendChatMessage(clientId: number, message: string, conversationId?: number) {
  // 1. RATE LIMITING
  // Verifica se usuário não excedeu 15 mensagens/minuto
  const recentMessages = await strapi.entityService.findMany('api::chat-message.chat-message', {
    filters: {
      conversation: { client: { id: clientId } },
      createdAt: { $gte: new Date(Date.now() - 60000) }
    }
  });
  if (recentMessages.length >= 15) throw Error('Rate limit exceeded');

  // 2. GERENCIAR CONVERSA
  let conversation;
  if (conversationId) {
    conversation = await findConversation(conversationId);
  } else {
    conversation = await createConversation(clientId, message);
  }

  // 3. SALVAR MENSAGEM DO USUÁRIO
  const userMessage = await createChatMessage({
    conversation: conversation.id,
    content: message,
    sender: 'user',
    messageType: 'text'
  });

  // 4. EXTRAIR PREFERÊNCIAS DO USUÁRIO
  try {
    await this.extractUserPreferences(clientId, message, conversation.id);
  } catch (error) {
    // Não falhar o chat se extração falhar
  }

  // 5. VALIDAR ESCOPO DA PERGUNTA
  if (!this.isQuestionInScope(message)) {
    return sendOutOfScopeResponse(conversation.id);
  }

  // 6. BUSCAR CONTEXTO DO PROJETO
  const context = await this.getProjectContext(clientId);

  // 7. DETECTAR PEDIDO DE RECOMENDAÇÃO
  const isAskingForRecommendations = detectRecommendationKeywords(message);
  let recommendedProductsText = '';

  if (isAskingForRecommendations) {
    const recommendations = await this.generateProductRecommendations(clientId, 5);
    recommendedProductsText = formatRecommendations(recommendations);
  }

  // 8. PREPARAR HISTÓRICO DA CONVERSA
  const conversationHistory = conversation.messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // 9. ADICIONAR CONTEXTO DO USUÁRIO
  const enhancedMessage = `${message}

DADOS DO USUÁRIO PARA REFERÊNCIA:
- Total gasto: R$ ${context.userStats.totalSpent}
- Pedidos realizados: ${context.userStats.totalPurchases}
- Quadrinhos comprados: ${context.userStats.totalProductsBought}
- Cupons utilizados: ${context.userStats.totalCouponsUsed}
${recommendedProductsText}`;

  conversationHistory.push({
    role: 'user',
    parts: [{ text: enhancedMessage }]
  });

  // 10. CHAMAR GEMINI API
  const aiResponse = await this.callGeminiAPI(conversationHistory, context);

  // 11. SALVAR RESPOSTA DA IA
  const aiMessage = await createChatMessage({
    conversation: conversation.id,
    content: aiResponse,
    sender: 'ai',
    messageType: 'text'
  });

  return {
    success: true,
    conversation: conversation.id,
    userMessage,
    aiMessage,
    response: aiResponse
  };
}
```

---

#### Método: `extractUserPreferences()`
**Arquivo**: `server/src/api/operation/services/operation.ts:511`

**Propósito**: Extrai automaticamente preferências do usuário a partir de suas mensagens.

**Tipos de Preferências Detectadas**:

1. **Autores**:
```typescript
// Padrões detectados:
"gosto de Frank Miller"
"adoro Alan Moore"
"fan de Neil Gaiman"
"Stan Lee é meu autor favorito"

// Regex:
/(?:gosto|adoro|amo|curto|prefiro|fan|fã)(?:\s+(?:de|do|da))?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
```

2. **Editoras**:
```typescript
"prefiro Marvel"
"gosto mais da DC"
"editora favorita é Image Comics"
```

3. **Categorias/Gêneros**:
```typescript
"curto super-heróis"
"gosto de horror"
"adoro mangá"
```

4. **Faixa de Preço**:
```typescript
"algo entre 20 e 50 reais"
"até 100 reais"
"entre R$ 30 e R$ 80"

// Armazenado como: "20-50"
```

5. **Faixa de Ano**:
```typescript
"quadrinhos dos anos 90"
"clássicos de 1980 a 2000"
"publicações recentes (2020-2024)"

// Armazenado como: "1990-1999"
```

**Confidence Score**: Cada preferência recebe um score de confiança (0-1):
- Menções explícitas: 0.8
- Menções indiretas: 0.6
- Inferências: 0.5

**Armazenamento**:
```typescript
await strapi.entityService.create('api::user-preference.user-preference', {
  data: {
    client: clientId,
    preference_type: 'author',
    preference_value: 'Frank Miller',
    confidence_score: 0.8,
    extracted_from_conversation: conversationId
  }
});
```

---

#### Método: `generateProductRecommendations()`
**Arquivo**: `server/src/api/operation/services/operation.ts:702`

**Propósito**: Gera recomendações personalizadas de produtos baseadas nas preferências do usuário.

**Algoritmo**:

```typescript
async generateProductRecommendations(clientId: number, limit: number = 8) {
  // 1. BUSCAR PREFERÊNCIAS DO USUÁRIO
  const preferences = await getUserPreferences(clientId, 'confidence_score:desc');

  if (preferences.length === 0) {
    // Retornar produtos populares/recentes
    return getPopularProducts(limit);
  }

  // 2. CONSTRUIR FILTROS DINÂMICOS
  const filters = {
    active: true,
    stock: { $gt: 0 },
    $or: []
  };

  // Agrupar preferências por tipo
  const prefsByType = groupByType(preferences);

  // Adicionar filtros para autores
  prefsByType.author.forEach(pref => {
    filters.$or.push({ author: { $containsi: pref.preference_value } });
  });

  // Adicionar filtros para editoras
  prefsByType.publisher.forEach(pref => {
    filters.$or.push({ publisher: { $containsi: pref.preference_value } });
  });

  // Adicionar filtros para categorias
  prefsByType.category.forEach(pref => {
    filters.$or.push({
      productCategories: { name: { $containsi: pref.preference_value } }
    });
  });

  // Filtro de faixa de preço (AND, não OR)
  if (prefsByType.price_range.length > 0) {
    const [min, max] = prefsByType.price_range[0].preference_value.split('-');
    filters.priceSell = { $gte: parseFloat(min), $lte: parseFloat(max) };
  }

  // 3. BUSCAR PRODUTOS MATCHING
  const products = await findProducts(filters, limit * 2);

  // 4. CALCULAR SCORE DE RELEVÂNCIA
  const scoredProducts = products.map(product => {
    let relevanceScore = 0;

    preferences.forEach(pref => {
      const confidenceWeight = pref.confidence_score;

      switch (pref.preference_type) {
        case 'author':
          if (product.author.includes(pref.preference_value)) {
            relevanceScore += 3 * confidenceWeight; // Peso alto para autores
          }
          break;

        case 'publisher':
          if (product.publisher.includes(pref.preference_value)) {
            relevanceScore += 2.5 * confidenceWeight;
          }
          break;

        case 'category':
          if (product.categories.includes(pref.preference_value)) {
            relevanceScore += 2 * confidenceWeight;
          }
          break;

        case 'price_range':
          const [min, max] = pref.preference_value.split('-');
          if (product.priceSell >= min && product.priceSell <= max) {
            relevanceScore += 1.5 * confidenceWeight;
          }
          break;
      }
    });

    // Bonus para estoque alto
    if (product.stock > 10) relevanceScore += 0.5;

    return { ...product, relevanceScore };
  });

  // 5. ORDENAR POR RELEVÂNCIA E LIMITAR
  return scoredProducts
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map(({ relevanceScore, ...product }) => product);
}
```

**Pesos de Relevância**:
- Autor: 3.0
- Editora: 2.5
- Categoria: 2.0
- Faixa de Preço: 1.5
- Faixa de Ano: 1.0
- Estoque Alto (>10): +0.5

---

#### Método: `calculateUserStats()`
**Arquivo**: `server/src/api/operation/services/operation.ts:405`

**Propósito**: Calcula estatísticas pessoais do usuário para contextualizar a IA.

**Métricas Calculadas**:

```typescript
{
  totalSpent: number;         // Total gasto em compras (R$)
  totalPurchases: number;     // Número de pedidos realizados
  totalProductsBought: number; // Total de quadrinhos comprados
  totalCouponsUsed: number;   // Cupons utilizados
}
```

**Cálculo**:
1. Busca compras finalizadas (`status: 'Entregue'`)
2. Soma valores dos produtos (quantidade × preço)
3. Subtrai devoluções (`quantityRefund`)
4. Conta cupons utilizados nas compras

**Uso**: Estas estatísticas são incluídas no contexto enviado ao Gemini:
```
DADOS DO USUÁRIO PARA REFERÊNCIA:
- Total gasto: R$ 150.00
- Pedidos realizados: 5
- Quadrinhos comprados: 12
- Cupons utilizados: 2
```

---

#### Método: `callGeminiAPI()`
**Arquivo**: `server/src/api/operation/services/operation.ts:898`

**Propósito**: Integração com a API do Google Gemini.

**Configuração do Modelo**:
```typescript
{
  model: 'gemini-2.5-flash',
  config: {
    temperature: 0.7,        // Criatividade moderada
    maxOutputTokens: 1024,   // ~768 palavras
    topP: 0.8,               // Nucleus sampling
    topK: 10                 // Top K sampling
  }
}
```

**Estrutura da Requisição**:
```typescript
const contents = [
  {
    role: 'user',
    parts: [{ text: SYSTEM_PROMPT }]  // Instruções e contexto
  },
  ...conversationHistory  // Histórico da conversa
];

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: contents,
  config: config
});
```

**System Prompt** (construído por `buildSystemPrompt()`):
```
Você é o Alfred, assistente virtual da "Quadrinho Rei".

INSTRUÇÕES IMPORTANTES:
- Responda APENAS sobre assuntos relacionados à loja
- Seja amigável e conhecedor do universo dos quadrinhos
- Use linguagem brasileira informal mas profissional
- Não invente informações que não estão no contexto
- Use as estatísticas do usuário quando perguntarem sobre dados pessoais

CONTEXTO DA LOJA:
Produtos disponíveis: [Lista de produtos]
Categorias: [Categorias disponíveis]

PREFERÊNCIAS CONHECIDAS DO USUÁRIO:
- Autores favoritos: Frank Miller, Alan Moore
- Editoras preferidas: DC Comics
- Categorias de interesse: Super-heróis, Horror

HISTÓRICO DE FEEDBACK:
- Respostas positivas: 8
- Respostas negativas: 2
- Taxa de satisfação: 80%
```

**Tratamento de Erros**:
- API Key não configurada → Retorna resposta mock de teste
- Erro de conexão → Retry automático (até 3 tentativas)
- Rate limit excedido → Mensagem de erro específica

---

#### Método: `isQuestionInScope()`
**Arquivo**: `server/src/api/operation/services/operation.ts:267`

**Propósito**: Validar se a pergunta está relacionada à loja.

**Keywords Aceitas** (75+ termos):
```typescript
const keywords = [
  // Produtos
  'quadrinho', 'comic', 'hq', 'produto', 'livro', 'autor', 'editora',
  'marvel', 'dc', 'manga', 'anime', 'herói', 'batman', 'superman',

  // E-commerce
  'pedido', 'compra', 'carrinho', 'pagamento', 'entrega', 'frete',
  'status', 'rastreamento', 'cancelar', 'devolver',

  // Loja
  'loja', 'funcionamento', 'horário', 'contato', 'troca', 'cupom',

  // Dados pessoais
  'quanto', 'quantos', 'meus', 'gastei', 'comprei', 'histórico',

  // Cumprimentos
  'olá', 'oi', 'hello', 'bom dia', 'alfred', 'assistente'
];
```

**Algoritmo**:
```typescript
const messageWords = message.toLowerCase().split(/\s+/);
return keywords.some(keyword =>
  messageWords.some(word =>
    word.includes(keyword) || keyword.includes(word)
  )
);
```

Se fora do escopo, retorna:
```
"Desculpe, só posso ajudar com questões relacionadas à Quadrinho Rei,
como informações sobre produtos, pedidos, trocas ou funcionamento da loja.
Como posso ajudá-lo com algo relacionado aos nossos quadrinhos?"
```

---

## Frontend (Next.js)

### Estrutura de Arquivos
```
client/src/
├── app/chat-ia/
│   ├── page.tsx        (Componente principal)
│   └── styled.ts       (Styled components)
└── services/
    └── chatService.ts  (Camada de comunicação com API)
```

### Componente Principal: `page.tsx`
**Arquivo**: `client/src/app/chat-ia/page.tsx`

#### Estados do Componente

```typescript
const [isExpanded, setIsExpanded] = useState(false);        // Sidebar
const [inputValue, setInputValue] = useState("");           // Input de texto
const [messages, setMessages] = useState<ChatMessage[]>([]); // Mensagens da conversa
const [currentConversation, setCurrentConversation] = useState<number | null>(null);
const [isLoading, setIsLoading] = useState(false);          // Carregando histórico
const [isTyping, setIsTyping] = useState(false);            // IA está "digitando"
const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
const chatEndRef = useRef<HTMLDivElement>(null);            // Auto-scroll
```

#### Ciclo de Vida

```typescript
// 1. Verificar autenticação ao montar
useEffect(() => {
  checkAuthentication();
}, []);

// 2. Carregar histórico quando autenticado
useEffect(() => {
  if (isAuthenticated) {
    loadChatHistory();
  }
}, [isAuthenticated]);

// 3. Auto-scroll quando mensagens mudam
useEffect(() => {
  scrollToBottom();
}, [messages, isTyping]);
```

#### Função: `checkAuthentication()`

```typescript
const checkAuthentication = async () => {
  try {
    const isAuth = await chatService.checkAuthStatus();
    setIsAuthenticated(isAuth);

    if (!isAuth) {
      toast.error("Você precisa estar logado para usar o chat");
      router.push("/login");
    }
  } catch (error) {
    setIsAuthenticated(false);
  }
};
```

#### Função: `loadChatHistory()`

```typescript
const loadChatHistory = async () => {
  try {
    setIsLoading(true);
    const conversations = await chatService.getChatHistory();

    if (conversations.length > 0) {
      const latestConversation = conversations[0];
      setCurrentConversation(latestConversation.id);
      setMessages(latestConversation.messages);
    } else {
      // Mostrar mensagem de boas-vindas
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        sender: 'ai',
        type: 'text',
        content: 'Olá! Sou o assistente virtual da Quadrinho Rei...',
        createdAt: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  } catch (error) {
    toast.error("Erro ao carregar histórico do chat");
  } finally {
    setIsLoading(false);
  }
};
```

#### Função: `handleSendMessage()`

```typescript
const handleSendMessage = async () => {
  if (isLoading || isTyping) return;

  // 1. VALIDAR MENSAGEM
  const validation = chatService.validateMessage(inputValue);
  if (!validation.isValid) {
    toast.error(validation.error);
    return;
  }

  const messageText = inputValue.trim();
  setInputValue("");
  setIsLoading(true);
  setIsTyping(true);

  // 2. ADICIONAR MENSAGEM TEMPORÁRIA DO USUÁRIO
  const userMessage: ChatMessage = {
    id: `temp-user-${Date.now()}`,
    sender: 'user',
    type: 'text',
    content: messageText,
    createdAt: new Date().toISOString()
  };
  setMessages(prev => [...prev, userMessage]);

  try {
    // 3. ENVIAR PARA BACKEND COM RETRY
    const response = await chatService.sendMessageWithRetry(
      messageText,
      currentConversation || undefined
    );

    // 4. ATUALIZAR COM MENSAGENS REAIS DO SERVIDOR
    setMessages(prev => {
      const filteredPrev = prev.filter(msg => msg.id !== userMessage.id);
      return [
        ...filteredPrev,
        {
          ...response.userMessage,
          sender: 'user' as const,
          type: 'text' as const
        },
        {
          ...response.aiMessage,
          sender: 'ai' as const,
          type: 'text' as const
        }
      ];
    });

    // 5. ATUALIZAR ID DA CONVERSA (SE NOVA)
    if (!currentConversation) {
      setCurrentConversation(response.conversation);
    }

    toast.success("Mensagem enviada!");

  } catch (error: any) {
    // 6. REMOVER MENSAGEM TEMPORÁRIA E MOSTRAR ERRO
    setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));

    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      sender: 'ai',
      type: 'text',
      content: error.message || 'Desculpe, ocorreu um erro.',
      isError: true,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, errorMessage]);
    toast.error(error.message);
  } finally {
    setIsLoading(false);
    setIsTyping(false);
  }
};
```

#### Função: `handleFeedback()`

```typescript
const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
  try {
    await chatService.sendFeedback(messageId, feedback);

    // Atualizar estado local
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, feedback } : msg
    ));

    toast.success(feedback === 'positive' ? 'Obrigado!' : 'Feedback registrado');
  } catch (error) {
    toast.error('Erro ao enviar feedback');
  }
};
```

#### UI: Renderização de Mensagens

```typescript
<ChatArea>
  {messages.map((msg) => (
    <MessageBubble key={msg.id} sender={msg.sender === 'user' ? 'sent' : 'received'}>
      {msg.sender === "ai" ? (
        <>
          <ReceivedMessage style={msg.isError ? errorStyle : {}}>
            {msg.content}
          </ReceivedMessage>

          {/* Botões de Feedback (apenas para IA) */}
          {!msg.isError && msg.id !== 'welcome' && (
            <FeedbackButtons>
              <FeedbackButton
                type="positive"
                active={msg.feedback === 'positive'}
                onClick={() => handleFeedback(msg.id, 'positive')}
                disabled={!!msg.feedback}
              >
                👍
              </FeedbackButton>
              <FeedbackButton
                type="negative"
                active={msg.feedback === 'negative'}
                onClick={() => handleFeedback(msg.id, 'negative')}
                disabled={!!msg.feedback}
              >
                👎
              </FeedbackButton>
            </FeedbackButtons>
          )}
        </>
      ) : (
        <SentMessage>{msg.content}</SentMessage>
      )}
    </MessageBubble>
  ))}

  {/* Indicador de digitação */}
  {isTyping && (
    <MessageBubble sender="received">
      <ReceivedMessage>
        Assistente está digitando...
      </ReceivedMessage>
    </MessageBubble>
  )}

  <div ref={chatEndRef} />
</ChatArea>
```

---

### Serviço: `chatService.ts`
**Arquivo**: `client/src/services/chatService.ts`

#### Interfaces TypeScript

```typescript
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'audio';
  content: string;
  createdAt?: string;
  isError?: boolean;
  feedback?: 'positive' | 'negative' | null;
  feedback_timestamp?: string;
}

export interface ChatConversation {
  id: number;
  title: string;
  active: boolean;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResponse {
  success: boolean;
  conversation: number;
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  response: string;
  error?: string;
}
```

#### Métodos do Serviço

##### `sendMessage()`
```typescript
async sendMessage(message: string, conversationId?: number): Promise<SendMessageResponse> {
  try {
    const response = await api.post(`/sendChatMessage`, {
      message,
      conversationId
    });
    return response.data;
  } catch (error: any) {
    // Tratamento de erro específico
    if (error.response?.status === 429) {
      throw new Error('Você está enviando mensagens muito rapidamente.');
    }
    if (error.response?.status === 401) {
      throw new Error('Você precisa estar logado para usar o chat.');
    }
    throw new Error(error.response?.data?.message || 'Erro ao enviar mensagem.');
  }
}
```

##### `getChatHistory()`
```typescript
async getChatHistory(conversationId?: number): Promise<ChatConversation[]> {
  try {
    const endpoint = conversationId
      ? `/getChatHistory/${conversationId}`
      : `/getChatHistory`;

    const response = await api.get(endpoint);
    return this.formatConversations(response.data);
  } catch (error) {
    throw new Error('Erro ao carregar histórico do chat.');
  }
}
```

##### `validateMessage()`
```typescript
validateMessage(message: string): { isValid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Mensagem não pode estar vazia' };
  }

  if (message.length > 1000) {
    return { isValid: false, error: 'Mensagem muito longa (máx 1000 caracteres)' };
  }

  return { isValid: true };
}
```

##### `sendMessageWithRetry()`
```typescript
async sendMessageWithRetry(
  message: string,
  conversationId?: number,
  maxRetries = 2
): Promise<SendMessageResponse> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await this.sendMessage(message, conversationId);
    } catch (error: any) {
      lastError = error;

      // Não fazer retry para rate limit ou autenticação
      if (error.message.includes('rapidamente') || error.message.includes('logado')) {
        throw error;
      }

      // Aguardar antes de retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
```

##### `formatConversations()`
```typescript
formatConversations(conversations: any[]): ChatConversation[] {
  return conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    active: conv.active,
    messages: this.formatMessages(conv.messages || []),
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt
  }));
}
```

---

## Fluxo de Funcionamento

### Fluxo Completo de Uma Mensagem

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO DIGITA MENSAGEM                                  │
│    "Quero recomendações de quadrinhos do Batman"            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 2. FRONTEND VALIDA                                          │
│    • Mensagem não vazia ✓                                   │
│    • Comprimento < 1000 caracteres ✓                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 3. ADICIONA MENSAGEM TEMPORÁRIA NA UI                       │
│    • Exibe mensagem do usuário imediatamente                │
│    • Ativa indicador "digitando..."                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 4. ENVIA POST /api/sendChatMessage                          │
│    { message: "...", conversationId: 123 }                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 5. BACKEND: Valida Autenticação                             │
│    • Verifica JWT token                                     │
│    • Busca cliente associado                                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 6. BACKEND: Rate Limiting                                   │
│    • Conta mensagens dos últimos 60 segundos                │
│    • Se >= 15 → Retorna erro 429                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 7. BACKEND: Gerencia Conversa                               │
│    • Se conversationId existe → Busca conversa              │
│    • Se não → Cria nova conversa                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 8. BACKEND: Salva Mensagem do Usuário                       │
│    • chat_messages: { content, sender: 'user', ... }        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 9. BACKEND: Extrai Preferências                             │
│    • Detecta: "Batman" → categoria: 'super-heróis'          │
│    • Salva em user_preferences com confidence 0.6           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 10. BACKEND: Valida Escopo                                  │
│     • isQuestionInScope("Batman...") → true ✓               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 11. BACKEND: Busca Contexto do Projeto                      │
│     • Produtos (20 mais recentes)                           │
│     • Categorias                                            │
│     • Compras recentes do usuário                           │
│     • Estatísticas: totalSpent, totalPurchases...           │
│     • Preferências do usuário                               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 12. BACKEND: Detecta Pedido de Recomendação                 │
│     • Keywords: "recomendações" → true                      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 13. BACKEND: Gera Recomendações Personalizadas              │
│     • Busca produtos que combinam com preferências          │
│     • Calcula score de relevância                           │
│     • Retorna top 5 produtos                                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 14. BACKEND: Monta Mensagem Enriquecida                     │
│     Mensagem original +                                     │
│     DADOS DO USUÁRIO +                                      │
│     PRODUTOS RECOMENDADOS                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 15. BACKEND: Prepara Payload para Gemini                    │
│     • System Prompt (contexto da loja)                      │
│     • Histórico da conversa                                 │
│     • Mensagem atual enriquecida                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 16. GEMINI API: Processa e Responde                         │
│     • Modelo: gemini-2.5-flash                              │
│     • Gera resposta contextualizada                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 17. BACKEND: Salva Resposta da IA                           │
│     • chat_messages: { content, sender: 'ai', ... }         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 18. BACKEND: Retorna Response                               │
│     {                                                        │
│       success: true,                                         │
│       conversation: 123,                                     │
│       userMessage: {...},                                    │
│       aiMessage: {...},                                      │
│       response: "Baseado em suas preferências..."           │
│     }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 19. FRONTEND: Atualiza Estado                               │
│     • Remove mensagem temporária                            │
│     • Adiciona mensagem real do usuário                     │
│     • Adiciona resposta da IA                               │
│     • Remove indicador "digitando"                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 20. FRONTEND: Renderiza na UI                               │
│     • Scroll automático para última mensagem                │
│     • Exibe botões de feedback (👍/👎)                     │
│     • Toast de sucesso                                      │
└─────────────────────────────────────────────────────────────┘
```

### Tempo Estimado do Fluxo
- **Frontend → Backend**: ~50ms
- **Backend (processamento)**: ~200ms
- **Gemini API**: ~1-2 segundos
- **Backend → Frontend**: ~50ms
- **Total**: ~1.5-2.5 segundos

---

## Sistema de Recomendações

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                  ENTRADA: Mensagem do Usuário               │
│  "Quero quadrinhos de terror, prefiro Stephen King"         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│           EXTRAÇÃO DE PREFERÊNCIAS (NLP Básico)             │
│                                                              │
│  Regex Patterns detectam:                                   │
│  • "terror" → category: 'terror' (confidence: 0.6)          │
│  • "Stephen King" → author: 'Stephen King' (conf: 0.8)      │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ user_preferences                              │          │
│  │ • client_id: 1                                │          │
│  │ • preference_type: 'author'                   │          │
│  │ • preference_value: 'Stephen King'            │          │
│  │ • confidence_score: 0.8                       │          │
│  └──────────────────────────────────────────────┘          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              BUSCA DE PREFERÊNCIAS ARMAZENADAS              │
│                                                              │
│  SELECT * FROM user_preferences                             │
│  WHERE client_id = 1                                        │
│  ORDER BY confidence_score DESC                             │
│                                                              │
│  Resultado:                                                 │
│  [                                                           │
│    { type: 'author', value: 'Stephen King', conf: 0.8 },    │
│    { type: 'author', value: 'Alan Moore', conf: 0.8 },      │
│    { type: 'category', value: 'terror', conf: 0.6 },        │
│    { type: 'publisher', value: 'DC Comics', conf: 0.7 }     │
│  ]                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│            CONSTRUÇÃO DE FILTROS DINÂMICOS                   │
│                                                              │
│  {                                                           │
│    active: true,                                            │
│    stock: { $gt: 0 },                                       │
│    $or: [                                                    │
│      { author: { $containsi: 'Stephen King' } },            │
│      { author: { $containsi: 'Alan Moore' } },              │
│      { productCategories.name: { $containsi: 'terror' } },  │
│      { publisher: { $containsi: 'DC Comics' } }             │
│    ]                                                         │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                BUSCA DE PRODUTOS MATCHING                    │
│                                                              │
│  SELECT * FROM products                                     │
│  WHERE (filters above)                                      │
│  LIMIT 16  (busca 2x o necessário para scoring)            │
│                                                              │
│  Produtos encontrados: 12                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│           CÁLCULO DE SCORE DE RELEVÂNCIA                     │
│                                                              │
│  Para cada produto:                                         │
│    relevanceScore = 0                                       │
│                                                              │
│    Para cada preferência:                                   │
│      Se produto.author contém pref.value:                   │
│        relevanceScore += 3.0 * confidence_score             │
│      Se produto.category contém pref.value:                 │
│        relevanceScore += 2.0 * confidence_score             │
│      Se produto.publisher contém pref.value:                │
│        relevanceScore += 2.5 * confidence_score             │
│                                                              │
│    Se produto.stock > 10:                                   │
│      relevanceScore += 0.5  (bonus)                         │
│                                                              │
│  Exemplo de cálculo:                                        │
│    Produto: "Watchmen" (Alan Moore, DC, Ficção Científica) │
│      • Autor "Alan Moore" match → +3.0 * 0.8 = +2.4        │
│      • Editora "DC Comics" match → +2.5 * 0.7 = +1.75      │
│      • Estoque: 15 → +0.5                                   │
│      Total: 4.65                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              ORDENAÇÃO E LIMITAÇÃO                           │
│                                                              │
│  Produtos ordenados por relevanceScore (DESC):              │
│  1. Watchmen (4.65)                                         │
│  2. V de Vingança (4.2)                                     │
│  3. Batman: O Cavaleiro das Trevas (3.8)                   │
│  4. Sandman Vol. 1 (3.5)                                    │
│  5. Constantine (3.2)                                       │
│                                                              │
│  Retorna TOP 5                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│           FORMATAÇÃO PARA GEMINI                             │
│                                                              │
│  PRODUTOS RECOMENDADOS COM BASE NAS PREFERÊNCIAS:           │
│  1. Watchmen - Alan Moore (DC Comics, 1986) - R$ 89.90     │
│  2. V de Vingança - Alan Moore (Panini, 2006) - R$ 75.00   │
│  3. Batman: O Cavaleiro das Trevas - Frank Miller           │
│     (DC Comics, 1986) - R$ 65.00                            │
│  ...                                                         │
│                                                              │
│  IMPORTANTE: Apresente esses produtos de forma natural...   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              GEMINI GERA RESPOSTA FINAL                      │
│                                                              │
│  "Com base no seu gosto por Stephen King e terror,          │
│   tenho ótimas recomendações! Embora não tenhamos           │
│   adaptações diretas de King no momento, você vai           │
│   adorar 'Watchmen' de Alan Moore, uma obra-prima           │
│   dark e psicológica. Também recomendo 'Constantine',       │
│   que tem aquele clima sobrenatural e sombrio..."           │
└─────────────────────────────────────────────────────────────┘
```

### Matriz de Pesos

| Tipo de Match | Peso Base | Multiplicador | Score Final |
|--------------|-----------|---------------|-------------|
| **Autor** | 3.0 | confidence_score | 3.0 * 0.8 = 2.4 |
| **Editora** | 2.5 | confidence_score | 2.5 * 0.7 = 1.75 |
| **Categoria** | 2.0 | confidence_score | 2.0 * 0.6 = 1.2 |
| **Faixa Preço** | 1.5 | confidence_score | 1.5 * 0.5 = 0.75 |
| **Faixa Ano** | 1.0 | confidence_score | 1.0 * 0.5 = 0.5 |
| **Estoque Alto** | 0.5 | fixo | 0.5 |

### Exemplo Real de Scoring

**Usuário**: "Gosto de Frank Miller e Batman"

**Preferências Extraídas**:
```json
[
  { "type": "author", "value": "Frank Miller", "confidence": 0.8 },
  { "type": "category", "value": "Batman", "confidence": 0.7 }
]
```

**Produto 1**: Batman: O Cavaleiro das Trevas (Frank Miller, DC, 1986)
```
Score = (3.0 * 0.8) [autor match]
      + (2.0 * 0.7) [categoria match]
      + 0.5 [estoque: 20]
      = 2.4 + 1.4 + 0.5
      = 4.3
```

**Produto 2**: Watchmen (Alan Moore, DC, 1986)
```
Score = 0 [sem matches diretos]
      = 0
```

**Produto 3**: Batman: Ano Um (Frank Miller, DC, 1987)
```
Score = (3.0 * 0.8) [autor match]
      + (2.0 * 0.7) [categoria match]
      + 0.5 [estoque: 15]
      = 4.3
```

**Resultado**: Produtos 1 e 3 serão priorizados nas recomendações.

---

## Configuração e Setup

### 1. Obter API Key do Google Gemini

#### Passo a Passo:
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada (formato: `AIza...`)

#### Limites da API Gratuita:
- **Requisições**: 15 por minuto
- **Tokens**: 32.000 tokens de entrada / 8.000 de saída
- **Custo**: Gratuito
- **Rate Limit**: Não há limite diário, apenas por minuto

### 2. Configurar Variáveis de Ambiente

#### Backend (`.env`):
```bash
# Google Gemini API
GEMINI_API_KEY=AIza_sua_chave_aqui
CHAT_ENABLED=true

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=quadrinhos-rei
DATABASE_USERNAME=seu_usuario
DATABASE_PASSWORD=sua_senha

# JWT
JWT_SECRET=seu_jwt_secret
```

#### Frontend (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:1337/api
NEXT_PUBLIC_CHAT_ENABLED=true
```

### 3. Instalar Dependências

```bash
# Backend
cd server
yarn add @google/generative-ai

# Frontend
cd client
yarn install
```

### 4. Criar Estruturas no Banco de Dados

As entidades são criadas automaticamente pelo Strapi na primeira execução:
- `chat_conversations`
- `chat_messages`
- `user_preferences`

**Verificar criação**:
```bash
# Conectar ao PostgreSQL
psql -h localhost -U seu_usuario -d quadrinhos-rei

# Verificar tabelas
\dt chat*
\dt user_preferences
```

### 5. Iniciar Aplicação

```bash
# Iniciar backend e frontend simultaneamente (do root)
yarn start

# Ou individualmente:
# Backend
cd server && yarn d

# Frontend
cd client && yarn dev
```

### 6. Testar Chat

1. Acesse `http://localhost:3000/login`
2. Faça login com um cliente existente
3. Navegue para `http://localhost:3000/chat-ia`
4. Digite uma mensagem: "Olá!"

**Resposta Esperada** (com API Key configurada):
```
Olá! Sou o assistente virtual da Quadrinho Rei.
Como posso ajudá-lo hoje?
```

**Resposta com Mock** (sem API Key):
```
Olá! Esta é uma resposta de teste do chat-IA da Quadrinho Rei.
Para ativar as respostas reais da IA, configure uma chave válida...
```

---

## Limitações e Controles

### Rate Limiting

#### Backend Rate Limit (15 msg/min por usuário)
**Implementação**: `server/src/api/operation/services/operation.ts:42`

```typescript
// Buscar mensagens dos últimos 60 segundos
const recentMessages = await strapi.entityService.findMany('api::chat-message.chat-message', {
  filters: {
    conversation: { client: { id: clientId } },
    createdAt: { $gte: new Date(Date.now() - 60000) }
  }
});

if (recentMessages.length >= 15) {
  throw new Error('Rate limit exceeded. Máximo 15 mensagens por minuto.');
}
```

**Resposta ao Usuário**:
```json
{
  "error": "Você está enviando mensagens muito rapidamente. Aguarde um momento."
}
```

#### Gemini API Rate Limit
- **15 requisições/minuto** (limite gratuito)
- Se excedido → Erro 429 do Gemini
- **Tratamento**: Retry automático após 1-2 segundos

### Validações de Mensagem

#### Frontend Validation
```typescript
// Tamanho máximo: 1000 caracteres
if (message.length > 1000) {
  return { isValid: false, error: 'Mensagem muito longa (máx 1000 caracteres)' };
}

// Não vazia
if (!message || message.trim().length === 0) {
  return { isValid: false, error: 'Mensagem não pode estar vazia' };
}
```

#### Backend Validation
```typescript
// Mensagem não vazia (controller)
if (!message || message.trim().length === 0) {
  return ctx.badRequest('Mensagem não pode estar vazia');
}

// Escopo da pergunta (service)
if (!this.isQuestionInScope(message)) {
  return "Desculpe, só posso ajudar com questões relacionadas à Quadrinho Rei...";
}
```

### Scope Filtering

**Objetivo**: Garantir que a IA só responda questões relacionadas à loja.

**Keywords Aceitas** (75+ termos):
- Produtos: quadrinho, comic, hq, produto, autor, editora, marvel, dc, manga
- E-commerce: pedido, compra, carrinho, pagamento, frete, entrega
- Loja: loja, funcionamento, troca, cupom, desconto
- Dados pessoais: quanto gastei, meus pedidos, histórico
- Cumprimentos: olá, oi, bom dia, alfred

**Exemplo de Mensagem Fora do Escopo**:
```
Usuário: "Qual a capital da França?"
IA: "Desculpe, só posso ajudar com questões relacionadas
     à Quadrinho Rei, como informações sobre produtos,
     pedidos, trocas ou funcionamento da loja."
```

### Segurança e Privacidade

#### Autenticação Obrigatória
```typescript
// Verifica JWT token em todas as requisições
const user = ctx.state.user;
if (!user) {
  return ctx.unauthorized('Você precisa estar logado');
}
```

#### Dados Sensíveis Não Expostos
- **Senhas**: Nunca incluídas no contexto
- **Cartões**: Não acessados pela IA
- **Endereços**: Apenas informados se usuário perguntar
- **Dados de Pagamento**: Abstraídos (apenas totais)

#### System Prompt Instruções de Segurança
```
INSTRUÇÕES IMPORTANTES:
- Não invente informações que não estão no contexto fornecido
- Não revele dados sensíveis de outros clientes
- Não execute ações (apenas informar)
```

### Limitações Conhecidas

1. **Áudio**: Funcionalidade planejada mas não implementada
   - UI tem botão de áudio (InputAudio)
   - Backend não processa áudio ainda
   - Exibe toast: "Funcionalidade de áudio em desenvolvimento"

2. **Transcrição**: Não implementada
   - Mensagens de áudio não são transcritas
   - Apenas texto é suportado

3. **Múltiplas Conversas Simultâneas**:
   - Frontend carrega apenas a conversa mais recente
   - Não há UI para listar/trocar entre conversas

4. **Busca Semântica**:
   - Extração de preferências usa regex simples
   - Não usa embeddings ou NLP avançado

5. **Contexto Limitado**:
   - Apenas 20 produtos enviados ao Gemini
   - Histórico completo da conversa enviado (pode exceder token limit em conversas longas)

6. **Idioma**:
   - Suporta apenas Português Brasileiro
   - Não há tradução automática

---

## Métricas e Monitoramento

### Logs do Backend

**Strapi Logger**:
```typescript
strapi.log.info('Calculating stats for clientId:', clientId);
strapi.log.error('Chat service error:', error);
```

**Console Logs** (debugging):
```typescript
console.log('=== CONTEXT SENT TO GEMINI ===');
console.log('User Stats:', userStats);
console.log('Products count:', context.products.length);
```

### Feedback do Usuário

**Armazenamento**:
```sql
UPDATE chat_messages
SET feedback = 'positive',
    feedback_timestamp = NOW()
WHERE id = 123;
```

**Consulta de Taxa de Satisfação**:
```sql
SELECT
  COUNT(*) FILTER (WHERE feedback = 'positive') as positive,
  COUNT(*) FILTER (WHERE feedback = 'negative') as negative,
  ROUND(
    COUNT(*) FILTER (WHERE feedback = 'positive')::decimal /
    NULLIF(COUNT(*) FILTER (WHERE feedback IS NOT NULL), 0) * 100,
    2
  ) as satisfaction_rate
FROM chat_messages
WHERE sender = 'ai';
```

**Uso no System Prompt**:
```
HISTÓRICO DE FEEDBACK:
- Respostas positivas: 8
- Respostas negativas: 2
- Taxa de satisfação: 80%
```

### Estatísticas de Uso

**Consultas Úteis**:

```sql
-- Total de conversas por cliente
SELECT client_id, COUNT(*) as total_conversations
FROM chat_conversations
GROUP BY client_id;

-- Mensagens por dia
SELECT DATE(created_at) as date, COUNT(*) as messages
FROM chat_messages
GROUP BY DATE(created_at);

-- Tempo médio de resposta (estimado)
SELECT AVG(
  EXTRACT(EPOCH FROM (ai_msg.created_at - user_msg.created_at))
) as avg_response_time_seconds
FROM chat_messages user_msg
JOIN chat_messages ai_msg
  ON ai_msg.conversation_id = user_msg.conversation_id
  AND ai_msg.id = user_msg.id + 1
WHERE user_msg.sender = 'user' AND ai_msg.sender = 'ai';
```

---

## Troubleshooting

### Problema: API Key Inválida

**Sintoma**:
```
Error: Gemini API error: Invalid API key
```

**Solução**:
1. Verificar que a key está no `.env`:
   ```bash
   grep GEMINI_API_KEY server/.env
   ```
2. Reiniciar o backend:
   ```bash
   cd server && yarn d
   ```

### Problema: Rate Limit Excedido

**Sintoma (Frontend)**:
```
"Você está enviando mensagens muito rapidamente. Aguarde um momento."
```

**Causa**: Mais de 15 mensagens em 60 segundos.

**Solução**: Aguardar 1 minuto antes de enviar nova mensagem.

### Problema: Conversa Não Carrega

**Sintoma**: Tela branca ou "Verificando autenticação..." infinito.

**Causa**: Token JWT expirado ou inválido.

**Solução**:
1. Fazer logout e login novamente
2. Verificar configuração do JWT no backend
3. Limpar localStorage:
   ```javascript
   localStorage.clear();
   ```

### Problema: IA Responde Fora do Escopo

**Sintoma**: IA responde perguntas não relacionadas à loja.

**Causa**: `isQuestionInScope()` retornou falso positivo.

**Solução**:
1. Adicionar mais keywords no filtro (operation.ts:268)
2. Reforçar instruções no System Prompt

### Problema: Recomendações Genéricas

**Sintoma**: IA não personaliza recomendações.

**Causa**: Preferências não foram extraídas corretamente.

**Solução**:
1. Verificar user_preferences no banco:
   ```sql
   SELECT * FROM user_preferences WHERE client_id = 1;
   ```
2. Melhorar regex patterns em `extractUserPreferences()`

---

## Próximos Passos (Roadmap)

### Curto Prazo
- [ ] Implementar transcrição de áudio (speech-to-text)
- [ ] UI para listar/gerenciar múltiplas conversas
- [ ] Exportar histórico de conversas (PDF/CSV)
- [ ] Melhorar extração de preferências (usar NLP)

### Médio Prazo
- [ ] Suporte a imagens (enviar fotos de produtos)
- [ ] Integração com sistema de carrinho (adicionar produtos via chat)
- [ ] Notificações push para mensagens
- [ ] Suporte multi-idioma

### Longo Prazo
- [ ] Busca semântica com embeddings
- [ ] Fine-tuning do modelo com dados da loja
- [ ] Integração com chatbots de redes sociais
- [ ] Analytics dashboard para administradores

---

## Conclusão

O sistema Chat-IA (Alfred) é uma solução completa de assistente virtual para e-commerce, combinando:
- **IA Conversacional** (Google Gemini)
- **Personalização** (Sistema de Preferências)
- **Recomendações Inteligentes** (Algoritmo de Scoring)
- **Persistência** (PostgreSQL)
- **UX Moderna** (React/Next.js)

Com arquitetura escalável, segurança robusta e experiência do usuário fluida, o sistema está pronto para atender clientes da Quadrinho Rei com suporte inteligente e personalizado.

---

**Documentação gerada em**: 2025-01-11
**Versão**: 1.0
**Autor**: Sistema Chat-IA Quadrinho Rei
