import styled from "styled-components";

// Estilo para o botão toggle
export const ToggleWrapper = styled.div`
  display: inline-block;
`;

export const ToggleSwitch = styled.div<{ isActive: boolean }>`
  width: 44px;  // Aumentado de 40px para 44px
  height: 24px;  // Aumentado de 20px para 24px
  background-color: ${({ isActive }) => (isActive ? "#4CAF50" : "#ccc")};
  border-radius: 24px;  // Mantém o border-radius proporcional à altura
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s ease;
`;

export const ToggleCircle = styled.div<{ isActive: boolean }>`
  width: 16.5px;  // Aumentado de 18px para 22px
  height: 16.5px;  // Aumentado de 18px para 22px
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 4px;  // Mantido para centralizar verticalmente
  left: ${({ isActive }) => (isActive ? "24px" : "4px")};  // Ajustado para o novo tamanho
  transition: left 0.3s ease;
`;
