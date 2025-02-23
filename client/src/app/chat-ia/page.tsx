"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { Message, mensagensExemplo } from "@/components/dadosFalsos";

export default function Conversas() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [mensagens, setMensagens] = useState<Message[]>(mensagensExemplo);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Título fixo para a conversa com a IA
  const title = "Assistente IA";

  useEffect(() => {
    // Rola para o final do chat ao montar o componente
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newMessage: Message = {
      id: `m${mensagens.length + 1}`,
      sender: "sent",
      type: "text",
      content: inputValue,
    };

    setMensagens([...mensagens, newMessage]);
    setInputValue("");
  };

  const handleAudioRecorded = (audioUrl: string) => {
    const newMessage: Message = {
      id: `m${mensagens.length + 1}`,
      sender: "sent",
      type: "audio",
      content: audioUrl,
    };

    setMensagens([...mensagens, newMessage]);
  };

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>{title}</Header>
        <Content>
          <ChatArea>
            {mensagens.map((msg) => (
              <MessageBubble key={msg.id} sender={msg.sender}>
                {msg.type === "text" ? (
                  msg.sender === "received" ? (
                    <ReceivedMessage>{msg.content}</ReceivedMessage>
                  ) : (
                    <SentMessage>{msg.content}</SentMessage>
                  )
                ) : msg.sender === "received" ? (
                  <ReceivedMessage>
                    <SoundPlayer src={msg.content} />
                  </ReceivedMessage>
                ) : (
                  <SentMessage>
                    <SoundPlayer src={msg.content} />
                  </SentMessage>
                )}
              </MessageBubble>
            ))}
            <div ref={chatEndRef} />
          </ChatArea>
        </Content>
        <Footer>
          <InputArea>
            <InputAudio
              id="text-input"
              name="textInput"
              placeholder="Mensagem..."
              value={inputValue}
              onChange={handleInputChange}
              onAudioRecorded={handleAudioRecorded}
              width="100%"
              height="50px"
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
            />
          </ButtonBox>
        </Footer>
      </ContentContainer>
    </>
  );
}
