import React from "react";
import ClickableIcon from "@/styles/ClickableIcon";


interface ClosedProps {
    onClick?: () => void;
    name?: string;
}


const Closed: React.FC<ClosedProps> = ({ onClick, name }) => (
  <ClickableIcon
    data-cy={name} // adiciona o atributo para testes
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}>
      <path d="M26 10L10 26M10 10L26 26" stroke="#747373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </ClickableIcon>
);


export default Closed;
