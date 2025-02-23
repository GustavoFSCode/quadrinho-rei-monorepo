import React from "react";
import ClickableIcon from "@/styles/ClickableIcon";


interface ClosedProps {
    onClick?: () => void;
}


const Closed: React.FC<ClosedProps> = ({ onClick }) => (
    <ClickableIcon 
        width="36" 
        height="36" 
        viewBox="0 0 36 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}>
            <path d="M26 10L10 26M10 10L26 26" stroke="#747373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </ClickableIcon>

);

export default Closed;