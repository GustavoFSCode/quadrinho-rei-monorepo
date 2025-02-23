// InputRead.styled.ts
import styled from "styled-components";

export const ReadOnlyInputWrapper = styled.div<{ width?: string }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${({ width }) => width || '365px'};
`;

export const ReadOnlyIconWrapper = styled.div`
  position: absolute;
  top: 68%;
  left: 93%; 
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    color: #aaa;
  }
`;

export const ReadOnlyStyledInput = styled.input<{
  hasIcon?: boolean;
  textAlign?: string;
}>`
  display: block;
  width: 100%;
  height: 39px;
  padding: 8px 12px;
  padding-left: ${({ hasIcon }) => (hasIcon ? '16px' : '16px')}; /* Espaço para o ícone */
  border-radius: 25px;
  font-size: 16px;
  color: #333;
  outline: none;
  border: 1px solid #a2a2a2;
  text-align: ${({ textAlign }) => textAlign || 'left'};

  &::placeholder {
    color: #aaa;
  }
`;
