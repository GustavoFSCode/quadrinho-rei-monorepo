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
    height: 540px;
    padding: 20px;
    border-radius: 60px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

    @media (max-width: 480px) {
        width: 90%;
        height: auto;
        border-radius: 20px;
        padding: 10px;
    }
`;

export const ModalHeader = styled.h2`
    display: flex;
    margin: 0 0 30px;
    justify-content: center;
    font-size: 20px;
    color: #333;
    font-weight: 400;

    @media (max-width: 480px) {
        font-size: 18px;
    }
`;

export const ModalBodyTop = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;

    label {
        font-size: 16px;
        color: #333;
        font-weight: 400;
        margin-left: 15px;
    }

    @media (max-width: 480px) {
        gap: 15px;

        label {
            font-size: 14px;
            margin-left: 10px;
        }
    }
`;

export const ModalBodyBottom = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;

    label {
        font-size: 16px;
        color: #333;
        font-weight: 400;
        margin-left: 15px;
    }

    @media (max-width: 480px) {
        gap: 15px;

        label {
            font-size: 14px;
            margin-left: 10px;
        }
    }
`;

export const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    margin-top: 30px;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        margin-top: 20px;
    }
`;

export const RadioBox = styled.div`
    display: flex;
    flex-direction: column;
`;

export const RadioTitle = styled.div`
    font-size: 16px;
    margin-bottom: 10px;
    margin-top: 20px;
    margin-left: 15px;

    @media (max-width: 480px) {
        font-size: 14px;
        margin-left: 10px;
    }
`;

export const RadioGroup = styled.div`
    display: flex;
    gap: 30px;

    @media (max-width: 480px) {
        flex-direction: column;
        gap: 15px;
    }
`;

export const RadioButton = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;

    input {
        margin-right: 8px;
        appearance: none;
        -moz-appearance: none;

        position: relative;
        height: 1rem;
        width: 1rem;
        min-width: 0.8125rem;
        border-radius: 50px;
        border: 1px solid var(--blue-100);
        background: transparent;

        &:checked {
            background-image: url('/assets/images/SelectBox.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            border: none; 
        }
    }

    span {
        font-size: 14px;
        color: #333;
    }

    @media (max-width: 480px) {
        span {
            font-size: 12px;
        }
    }
`;
