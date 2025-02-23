// InputEdit/styled.ts
import styled from "styled-components";

export const EditInputWrapper = styled.div<{ width?: string }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${({ width }) => width || '365px'};
`;

export const EditLabel = styled.label`
  font-size: 14px;
  text-align: left;
  font-weight: 500;
  color: #555;
  margin-bottom: 5px;
`;

export const EditStyledInput = styled.input<{
  isEditing: boolean;
}>`
  display: block;
  width: 100%;
  height: 39px;
  padding: 8px 40px 8px 16px; /* Espaço para o ícone */
  border-radius: 25px;
  font-size: 16px;
  color: ${({ isEditing }) => (isEditing ? '#747373' : '#2D2D2D')};
  outline: none;
  border: 1px solid #a2a2a2;
  
  &::placeholder {
    color: #aaa;
  }
`;

export const EditButton = styled.button`
  position: absolute;
  top: 73%;
  right: 12px; 
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  svg {
    width: 30px;
    height: 30px;
    color: #aaa;
  }

  &:hover svg {
    color: #555;
  }
`;
