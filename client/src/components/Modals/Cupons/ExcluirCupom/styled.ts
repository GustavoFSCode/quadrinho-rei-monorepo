import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalBox = styled.div`
  background-color: #fff;
  padding: 32px;
  border-radius: 32px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

export const ModalText = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin: 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 10px;
`;
