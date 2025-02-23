import React from "react";
import { SetaIcon } from "../Navbar/styled"; // Atualize o caminho conforme necessário

interface SetaProps {
    onClick?: () => void;
    style?: React.CSSProperties;
}

const Seta: React.FC<SetaProps> = ({ onClick, style }) => (
    <SetaIcon
        onClick={onClick}
        style={style} 
        viewBox="0 0 14 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M13 11L8 6L13 1M6 11L1 6L6 1"
            stroke="#A2A2A2"
            strokeWidth="2"  
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </SetaIcon>
);

export default Seta;
