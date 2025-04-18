import styled from 'styled-components';

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalBox = styled.div`
    background: white;
    width: 300px;
    height: 300px;
    padding: 20px;
    border-radius: 40px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 51px;
`;

export const ModalText = styled.p`
    font-size: 18px;
    font-weight: 500;
    color: #333;
    text-align: center;
`;
