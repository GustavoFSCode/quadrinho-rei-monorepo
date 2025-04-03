import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px; /* Espaçamento de 20px entre os cards */
  flex-wrap: wrap;
  align-items: flex-start;
`;

export const Card = styled.div`
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 1rem;
  width: 300px; /* Largura fixa para cada card */
  display: flex;
  flex-direction: column;
  background-color: #fff;
`;

export const CardInfo = styled.div`
  margin-bottom: 1rem;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

export const Title = styled.h4`
  font-size: 16px;
  color: #000;
  margin-bottom: 0.5rem;
`;

export const Text = styled.p`
  font-size: 14px;
  color: #333;
  margin: 0.2rem 0;
`;

export const CustomCheckbox = styled.input`
  margin-right: 0.5rem;
`;

export const CustomLabel = styled.label`
  font-size: 14px;
  color: #333;
`;

export const ValueInputContainer = styled.div`
  margin-top: 1rem;
`;

export const ToggleBox = styled.div`
  pointer-events: none;
  margin-bottom: 10px;
`;
