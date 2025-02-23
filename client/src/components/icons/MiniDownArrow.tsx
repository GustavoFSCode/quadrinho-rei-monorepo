import React from "react";
import ClickableIcon from "@/styles/ClickableIcon";


interface MiniDownArrowProps {
    onClick?: () => void;
}


const MiniDownArrow: React.FC<MiniDownArrowProps> = ({ onClick }) => (
    <ClickableIcon 
    width="12" 
    height="7" 
    viewBox="0 0 12 7" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}>
        <path d="M1 6L6 1L11 6" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </ClickableIcon>

);

export default MiniDownArrow;