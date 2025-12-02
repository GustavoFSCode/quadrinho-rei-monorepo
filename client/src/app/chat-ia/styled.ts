import styled from "styled-components";

export const ContentContainer = styled.div<{ isExpanded: boolean }>`
  background-color: #ffffff;
  margin-left: ${(props) => (props.isExpanded ? "200px" : "80px")};
  border-radius: 8px;
  font-family: "Primary", sans-serif;
  transition: margin-left 0.3s ease;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  height: 131px;
  width: 100%;
  text-align: left;
  padding-left: 44px;
  font-size: 24px;
  font-weight: 400;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 0px 2px 2px -1px rgba(0, 0, 0, 0.25);
`;

export const Content = styled.div`
  height: 85vh;
  width: auto;
  margin: 5px 12px 0 44px;
  padding: 12px 10px 0 10px;
  border-radius: 4px;
  flex-grow: 1;
  overflow-y: auto;
  background-color: #ffffff;

  &::-webkit-scrollbar {
    width: 8px;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #bfbfbf;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
    padding: 5px;
  }
`;

export const ChatArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px;
`;

export const MessageBubble = styled.div<{ sender: "received" | "sent" }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) =>
    props.sender === "received" ? "flex-start" : "flex-end"};
  position: relative;
`;

export const ReceivedMessage = styled.div`
  background-color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  color: #2d2d2d;
  padding: 10px 15px;
  border-radius: 0 15px 15px 15px;
  max-width: 50vw;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -12px;
    width: 12px;
    height: 15px;
    background-color: #ffffff;
    border-top-left-radius: 55px;
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.1);
  }
`;

export const SentMessage = styled.div`
  background-color: #f1de3b;
  font-size: 16px;
  font-weight: 400;
  color: #2d2d2d;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 50vw;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: -8px;
    width: 20px;
    height: 15px;
    background-color: #f1de3b;
    border-top-right-radius: 55px;
  }
`;

export const Footer = styled.div`
  z-index: 1000;
  display: flex;
  width: 100%;
  height: 80px;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid #e0e0e0;
  padding: 0 20px;
  gap: 10px;
  box-shadow: 0px -2px 2px -1px rgba(0, 0, 0, 0.25);
`;

export const InputArea = styled.div`
  position: relative;
  width: -webkit-fill-available;
`;

export const ButtonBox = styled.div`
  display: flex;
  width: 50px;
  height: 50px;
  justify-content: flex-end;
`;

export const FeedbackButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
`;

export const FeedbackButton = styled.button<{ active?: boolean; type?: 'positive' | 'negative' }>`
  background: ${props => props.active ? (props.type === 'positive' ? '#4caf50' : '#f44336') : 'transparent'};
  border: 1px solid ${props => props.active ? (props.type === 'positive' ? '#4caf50' : '#f44336') : '#ccc'};
  color: ${props => props.active ? '#fff' : '#666'};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  padding: 0;

  &:hover {
    background: ${props => props.active ? (props.type === 'positive' ? '#45a049' : '#e53935') : '#f0f0f0'};
    border-color: ${props => props.type === 'positive' ? '#4caf50' : '#f44336'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
