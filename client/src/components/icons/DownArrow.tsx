import React from "react";
import ClickableIcon from "@/styles/ClickableIcon";


interface DownArrowProps {
    onClick?: () => void;
}


const DownArrow: React.FC<DownArrowProps> = ({ onClick }) => (
    <ClickableIcon 
        width="20" 
        height="20" 
        viewBox="0 0 22 22" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}>
            <path d="M3.5 13L10 7L16.5 13" stroke="#747373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </ClickableIcon>

);

export default DownArrow;
