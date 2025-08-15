"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SoundPlayer from "@/components/SoundPlayer";
import Send from "@/components/icons/Send";
import {
  ContentContainer,
  Header,
  Content,
  Footer,
  InputArea,
  ButtonBox,
  ChatArea,
  MessageBubble,
  ReceivedMessage,
  SentMessage,
} from "./styled";
import Button from "@/components/Button";
import InputAudio from "@/components/Inputs/InputAudio";
import chatService, { ChatMessage, ChatConversation } from "@/services/chatService";
import { toast } from "react-toastify";

export default function ChatIA() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const title = "Assistente IA - Quadrinho Rei";

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Carregar histórico quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
    }
  }, [isAuthenticated]);

  // Auto-scroll quando mensagens mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const checkAuthentication = async () => {
    try {
      const isAuth = await chatService.checkAuthStatus();
      setIsAuthenticated(isAuth);
      
      if (!isAuth) {
        toast.error("Você precisa estar logado para usar o chat");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const conversations = await chatService.getChatHistory();
      
      if (conversations.length > 0) {
        const latestConversation = conversations[0];
        setCurrentConversation(latestConversation.id);
        setMessages(latestConversation.messages);
      } else {
        // Se não há conversas, mostrar mensagem de boas-vindas
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          sender: 'ai',
          type: 'text',
          content: 'Olá! Sou o assistente virtual da Quadrinho Rei. Como posso ajudá-lo hoje? Posso responder sobre nossos produtos, pedidos, trocas e tudo relacionado à nossa loja de quadrinhos!',
          createdAt: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error: any) {
      console.error("Error loading chat history:", error);
      toast.error(error.message || "Erro ao carregar histórico do chat");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (isLoading || isTyping) return;

    const validation = chatService.validateMessage(inputValue);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const messageText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // Adicionar mensagem do usuário imediatamente
    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      sender: 'user',
      type: 'text',
      content: messageText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatService.sendMessageWithRetry(
        messageText,
        currentConversation || undefined
      );

      // Atualizar com as mensagens reais do servidor
      setMessages(prev => {
        // Remover a mensagem temporária do usuário
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

      // Atualizar ID da conversa se é uma nova conversa
      if (!currentConversation) {
        setCurrentConversation(response.conversation);
      }

      toast.success("Mensagem enviada!");

    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Remover mensagem temporária e mostrar erro
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      // Adicionar mensagem de erro
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        type: 'text',
        content: error.message || 'Desculpe, ocorreu um erro. Tente novamente.',
        isError: true,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error(error.message || "Erro ao enviar mensagem");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleAudioRecorded = (audioUrl: string) => {
    // Por enquanto, vamos manter a funcionalidade básica de áudio
    // TODO: Implementar transcrição de áudio para texto
    toast.info("Funcionalidade de áudio em desenvolvimento. Use mensagens de texto por enquanto.");
  };

  // Se ainda está verificando autenticação, mostrar loading
  if (isAuthenticated === null) {
    return (
      <>
        <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <ContentContainer isExpanded={isExpanded}>
          <Header>Carregando...</Header>
          <Content>
            <ChatArea>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Verificando autenticação...
              </div>
            </ChatArea>
          </Content>
        </ContentContainer>
      </>
    );
  }

  // Se não autenticado, não renderizar
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>{title}</Header>
        <Content>
          <ChatArea>
            {isLoading && messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Carregando histórico do chat...
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} sender={msg.sender === 'user' ? 'sent' : 'received'}>
                  {msg.type === "text" ? (
                    msg.sender === "ai" ? (
                      <ReceivedMessage style={msg.isError ? { backgroundColor: '#ffebee', color: '#c62828' } : {}}>
                        {msg.content}
                      </ReceivedMessage>
                    ) : (
                      <SentMessage>{msg.content}</SentMessage>
                    )
                  ) : msg.sender === "ai" ? (
                    <ReceivedMessage>
                      <SoundPlayer src={msg.content} />
                    </ReceivedMessage>
                  ) : (
                    <SentMessage>
                      <SoundPlayer src={msg.content} />
                    </SentMessage>
                  )}
                </MessageBubble>
              ))
            )}
            
            {isTyping && (
              <MessageBubble sender="received">
                <ReceivedMessage>
                  <div style={{ opacity: 0.7 }}>
                    Assistente está digitando...
                  </div>
                </ReceivedMessage>
              </MessageBubble>
            )}
            
            <div ref={chatEndRef} />
          </ChatArea>
        </Content>
        <Footer>
          <InputArea>
            <InputAudio
              id="text-input"
              name="textInput"
              placeholder={isLoading ? "Aguarde..." : "Digite sua mensagem sobre quadrinhos..."}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onAudioRecorded={handleAudioRecorded}
              width="100%"
              height="50px"
              disabled={isLoading || isTyping}
            />
          </InputArea>
          <ButtonBox>
            <Button
              width="50px"
              height="50px"
              text={<Send />}
              variant="purple"
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || isTyping || !inputValue.trim()}
            />
          </ButtonBox>
        </Footer>
      </ContentContainer>
    </>
  );
}