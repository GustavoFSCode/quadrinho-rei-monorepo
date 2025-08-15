import api from "./api";

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'audio';
  content: string;
  createdAt?: string;
  isError?: boolean;
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

class ChatService {
  private baseURL = '/operation';

  async sendMessage(message: string, conversationId?: number): Promise<SendMessageResponse> {
    try {
      const response = await api.post(`${this.baseURL}/sendChatMessage`, {
        message,
        conversationId
      });

      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Tratamento de erro mais específico
      if (error.response?.status === 429) {
        throw new Error('Você está enviando mensagens muito rapidamente. Aguarde um momento.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Você precisa estar logado para usar o chat.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Erro ao enviar mensagem. Tente novamente.');
    }
  }

  async getChatHistory(conversationId?: number): Promise<ChatConversation[]> {
    try {
      const endpoint = conversationId 
        ? `${this.baseURL}/getChatHistory/${conversationId}` 
        : `${this.baseURL}/getChatHistory`;
        
      const response = await api.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('Error getting chat history:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Você precisa estar logado para acessar o histórico.');
      }
      
      throw new Error('Erro ao carregar histórico do chat.');
    }
  }

  // Método para converter mensagens do formato do backend para o formato do frontend
  formatMessages(messages: any[]): ChatMessage[] {
    return messages.map(msg => ({
      id: msg.id.toString(),
      sender: msg.sender,
      type: msg.messageType || 'text',
      content: msg.content,
      createdAt: msg.createdAt,
      isError: msg.isError || false
    }));
  }

  // Método para converter conversas do formato do backend para o formato do frontend
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

  // Método para detectar se o usuário está autenticado
  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await api.get('/users/me');
      return !!response.data;
    } catch (error) {
      return false;
    }
  }

  // Método utilitário para limitar o tamanho da mensagem
  validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: 'Mensagem não pode estar vazia' };
    }
    
    if (message.length > 1000) {
      return { isValid: false, error: 'Mensagem muito longa. Máximo 1000 caracteres.' };
    }
    
    return { isValid: true };
  }

  // Método para retry automático em caso de falha temporária
  async sendMessageWithRetry(
    message: string, 
    conversationId?: number, 
    maxRetries = 2
  ): Promise<SendMessageResponse> {
    let lastError: Error = new Error('Falha ao enviar mensagem após múltiplas tentativas');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendMessage(message, conversationId);
      } catch (error: any) {
        lastError = error;
        
        // Não fazer retry para erros de rate limit ou autenticação
        if (error.message.includes('rapidamente') || error.message.includes('logado')) {
          throw error;
        }
        
        // Se não é a última tentativa, aguardar um pouco antes de tentar novamente
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }
}

export default new ChatService();