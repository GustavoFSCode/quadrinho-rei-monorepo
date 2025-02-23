import styled, { css } from "styled-components";

export const StyledButton = styled.button<{
  width?: string;
  weight?: string;
  height?: string;
  variant?: "purple" | "red" | "green" | "outline" | "disabled";
}>`
  width: ${({ width }) => width || "300px"};
  height: ${({ height }) => height || "44px"};
  padding: 12px 0;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 18px;
  font-family: 'Primary';
  font-weight: ${({ weight }) => weight || "400"};
  transition: background-color 0.3s, box-shadow 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  ${({ variant }) =>
    variant === "purple" &&
    css`
      background-color: var(--yellow-100); /* Amrelo */
      color: #fff;

      &:hover {
        background-color: var(--alert-yellow-40); /* Tom mais escuro */
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.15);
      }
    `}

  ${({ variant }) =>
    variant === "disabled" &&
    css`
      background-color: #A2A2A2;
      color: #fff;
      &:hover {
        background-color: #A2A2A2;
        box-shadow: none;
      }
    `}

  ${({ variant }) =>
    variant === "red" &&
    css`
      background-color: var(--red-100);
      color: #fff;

      &:hover {
        background-color: var(--red-80); /* Tom mais escuro */
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.15);
      }
    `}

  ${({ variant }) =>
    variant === "green" &&
    css`
      background-color: var(--alert-green-60);
      color: #fff;

      &:hover {
        background-color: var(--alert-green-40); /* Tom mais escuro */
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.15);
      }
    `}

  ${({ variant }) =>
    variant === "outline" &&
    css`
      background-color: transparent;
      border: 2px solid;
      border-color: var(--yellow-100);
      color: var(--yellow-100);

      &:hover {
        border-color: var(--alert-yellow-40); /* Tom mais escuro */
        color: var(--alert-yellow-40);
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.15);
      }

      &.red {
        border-color: var(--red-100);
        color: var(--red-100);

        &:hover {
          border-color: var(--red-60); /* Tom mais escuro */
          color: var(--red-60);
        }
      }

      &.green {
        border-color: var(--alert-green-40);
        color: var(--alert-green-40);

        &:hover {
          border-color: var(--alert-green-60); /* Tom mais escuro */
          color: var(--alert-green-60);
        }
      }
    `}

  /* Estilos para o estado desabilitado */
  &:disabled {
    background-color: #A2A2A2;
    color: #fff;
    cursor: default;
    box-shadow: none;
  }
`;
