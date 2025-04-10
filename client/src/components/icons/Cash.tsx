import React from "react";
import ClickableIcon from '../../styles/ClickableIcon';

interface CashProps {
    onClick?: () => void;
}

const Cash: React.FC<CashProps> = ({ onClick }) => (
        <ClickableIcon 
        width="30" 
        height="30" 
        viewBox="0 0 30 30" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}>
        <path d="M15 11C13.3444 11 12 11.9 12 13C12 14.1 13.3444 15 15 15C16.6556 15 18 15.9 18 17C18 18.1 16.6556 19 15 19M15 11V19M15 11V10M15 11C15.9578 10.9564 16.9182 11.3258 17.6 12M15 19V20M15 19C14.0421 19.0436 13.0818 18.6742 12.4 18M24.2333 18.8222C23.7281 20.0338 22.9922 21.1357 22.0667 22.0667C21.1387 22.9958 20.036 23.7322 18.8222 24.2333C17.6115 24.7394 16.3123 25 15 25C13.6877 25 12.3885 24.7394 11.1778 24.2333C9.96838 23.724 8.86722 22.9886 7.93335 22.0667C7.00421 21.1387 6.26786 20.036 5.76668 18.8222C5.25838 17.6121 4.99769 16.3125 5.00002 15C5.00002 12.3478 6.05358 9.80429 7.92895 7.92893C9.80431 6.05357 12.3478 5 15 5C17.6522 5 20.1957 6.05357 22.0711 7.92893C23.9464 9.80429 25 12.3478 25 15C25.0023 16.3125 24.7416 17.6121 24.2333 18.8222Z" stroke="#747373" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </ClickableIcon>
);

export default Cash;