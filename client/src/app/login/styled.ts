import styled from "styled-components";

interface PositionProps {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

interface CircleProps {
  color?: string;
  position: PositionProps;
}

export const Container = styled.div`
  background-color: #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative; /* Para garantir que os círculos fiquem no fundo */
  overflow: hidden; /* Para evitar que elementos extrapolem o container */
`;

export const CirclesWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
`;

export const Circle = styled.div<CircleProps>`
  position: absolute;
  width: 221.41px;
  height: 221.25px;
  background-color: ${({ color }) => color || "#f06292"};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 48px;
  font-weight: bold;
  ${({ position }) => `
    top: ${position.top || "auto"};
    right: ${position.right || "auto"};
    bottom: ${position.bottom || "auto"};
    left: ${position.left || "auto"};
  `}
  transform: translate(-50%, -50%);
`;

export const CircleText = styled.span`
  font-size: 64px;
  font-family: "Gobold", sans-serif;
  background-color: rgba(255, 255, 255, 0.274);
  border-radius: 100%;
  padding: 35px 40px;
  font-weight: 400;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* Centraliza o conteúdo horizontalmente */
  justify-content: center; /* Centraliza o conteúdo verticalmente */
  padding: 40px;
  text-align: center;

  > h2 {
    font-family: "SuperBrain";
    padding-bottom: 50px;
    color: var(--red-100);
    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  }

  > p {
    color: var(--black-100);
    font-size: 18px;
    font-weight: 500;
    line-height: 21.48px;
    padding-bottom: 30px;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
`;

export const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 48px;
    color: #ff4081;
    margin: 0;
  }

  h2 {
    font-size: 18px;
    color: #d32f2f;
    margin-top: 5px;
  }
`;

export const AdminArea = styled.h1`
  font-size: 48px;
  font-family: "SuperBrain";
  color: var(--yellow-100);
  margin-bottom: 30px;
  font-weight: 400;
  line-height: 33.6px;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  padding-right: 260px;
  padding-bottom: 15px;

  label {
    margin-left: 8px;
    font-size: 14px;
    color: #555;
  }

  input[type="checkbox"] {
    width: 17px;
    height: 17px;
    gap: 0px;
    border: 1px solid #6B75D1;
    cursor: pointer;
  }
`;
