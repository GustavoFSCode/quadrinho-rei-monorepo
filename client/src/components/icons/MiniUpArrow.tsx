import React from "react";
import ClickableIcon from "@/styles/ClickableIcon";

interface MiniUpArrowProps {
    onClick?: () => void;
}

const MiniUpArrow: React.FC<MiniUpArrowProps> = ({ onClick }) => (
    <ClickableIcon 
    width="12" 
    height="7" 
    viewBox="0 0 12 7" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}>
        <path d="M1 1L6 6L11 1" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </ClickableIcon>

);

export default MiniUpArrow;