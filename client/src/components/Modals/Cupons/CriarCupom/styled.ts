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

export const ModalContent = styled.div`
    background: white;
    width: 500px;
    max-height: 600px;
    padding: 20px;
    border-radius: 60px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (max-width: 480px) {
        width: 90%;
        border-radius: 60px;
        padding: 10px;
    }

    @media(max-height: 700px) {
      max-height: 535px;
    }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #333;

  svg {
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
`;

export const ModalBody = styled.div`
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;

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

export const SubmitButton = styled.button`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.alert5};
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.alert1};
  font-size: 14px;
  margin-top: -8px;
`;
