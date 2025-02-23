import React from "react";
import ClickableIcon from "@/styles/ClickableIcon";

interface MiniUpArrowActiveProps {
    onClick?: () => void;
}

const MiniUpArrowActive: React.FC<MiniUpArrowActiveProps> = ({ onClick }) => (
    <ClickableIcon 
    width="16" 
    height="10" 
    viewBox="0 0 16 10" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}>
        <path d="M2 8L8 2L14 8" stroke="#6B75D1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </ClickableIcon>

);

export default MiniUpArrowActive;