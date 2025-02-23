import React from "react";
import ClickableIcon from '../../styles/ClickableIcon';

interface TrashProps {
    onClick?: () => void;
}

const Trash: React.FC<TrashProps> = ({ onClick }) => (
    <ClickableIcon 
    viewBox="0 0 30 30" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    onClick={onClick}>
        <path d="M8.17822 8.34033V22.7837C8.17908 23.3712 8.41285 23.9344 8.82829 24.3499C9.24373 24.7653 9.80694 24.9991 10.3945 24.9999H19.2162C19.8037 24.9991 20.3669 24.7653 20.7823 24.3499C21.1978 23.9344 21.4315 23.3712 21.4324 22.7837V8.34033H8.17822Z" stroke="#747373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.12427 8.34033H23.8758" stroke="#747373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.3297 5V8.32976H11.6702V5H18.3297Z" stroke="#747373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.7729 12.5781V20.5674" stroke="#747373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.2163 12.5781V20.5674" stroke="#747373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </ClickableIcon>
);

export default Trash;
