import styled from 'styled-components';

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
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

export const ModalHeader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-bottom: 20px;
    font-size: 20px;
    color: #333;

    svg {
        position: absolute;
        right: 0;
        cursor: pointer;
    }

    @media (max-width: 480px) {
        font-size: 18px;
    }
`;

export const CheckboxGroupLabel = styled.label`
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
`;

export const CheckboxGroupContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 10px;
`;

export const CheckboxItem = styled.div`
  /* Você pode adicionar estilizações específicas para cada item, se necessário */
`;
