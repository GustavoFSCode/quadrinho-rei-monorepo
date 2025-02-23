import styled from "styled-components";

interface SelectWrapperProps {
  width?: string;
}

export const SelectWrapper = styled.div<SelectWrapperProps>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${({ width }) => width || '200px'};

  @media (max-width: 620px) {
    width: 100%; // Ajuste para ocupar 100% da largura em telas menores
  }
`;

export const Label = styled.label`
  font-size: 14px;
  text-align: left;
  font-weight: 300;
  color: #555;
  margin-bottom: 5px;
`;
