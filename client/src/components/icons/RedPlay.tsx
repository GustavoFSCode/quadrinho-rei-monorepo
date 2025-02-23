import React from "react";
import ClickableIcon from '../../styles/ClickableIcon';

interface RedPlayProps {
    onClick?: () => void;
}

const RedPlay: React.FC<RedPlayProps> = ({ onClick }) => (
    <ClickableIcon 
    width="30" 
    height="30" 
    viewBox="0 0 30 30" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}>
        <rect width="30" height="30" rx="15" fill="#FF2222"/>
        <path d="M10.1387 9.24208C10.1387 8.44534 10.1386 8.04288 10.332 7.82932C10.416 7.7337 10.5235 7.65485 10.647 7.59811C10.7706 7.54137 10.9071 7.50818 11.0473 7.50085C11.376 7.48442 11.7627 7.70603 12.5458 8.14958L22.7058 13.9075C23.3535 14.2689 23.6727 14.458 23.7887 14.688C23.8853 14.8879 23.8853 15.1121 23.7887 15.312C23.6727 15.542 23.3535 15.7311 22.7058 16.0925L12.5458 21.8504C11.7627 22.294 11.376 22.5156 11.0473 22.4991C10.9071 22.4918 10.7706 22.4586 10.647 22.4019C10.5235 22.3451 10.416 22.2663 10.332 22.1707C10.1386 21.9571 10.1387 21.5547 10.1387 20.7579V9.24208Z" fill="white"/>
    </ClickableIcon>
);

export default RedPlay;