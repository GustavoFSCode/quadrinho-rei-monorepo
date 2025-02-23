import React from "react";
import ClickableIcon from '../../styles/ClickableIcon';

interface PencilProps {
    onClick?: () => void;
}

const Pencil: React.FC<PencilProps> = ({ onClick }) => (
    <ClickableIcon 
        viewBox="0 0 30 30" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
    >
        <path d="M18.6218 8.65414L21.3461 11.3785M25 9L21 5L5.01081 20.9892L5 25L9.01081 24.9892L25 9Z" 
              stroke="#747373" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"/>
    </ClickableIcon>
);

export default Pencil;
