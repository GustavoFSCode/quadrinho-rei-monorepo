import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px; /* Espaçamento de 20px entre os quadrados */
  flex-wrap: wrap;
`;

export const Card = styled.div`
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 20px;
  width: 300px; /* Largura fixa para cada "card" */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
`;

export const AddressInfo = styled.div`
  margin-bottom: 1rem;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
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

export const CustomCheckbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 0.5rem;
`;

export const CustomLabel = styled.label`
  font-size: 14px;
  color: #333;
`;
