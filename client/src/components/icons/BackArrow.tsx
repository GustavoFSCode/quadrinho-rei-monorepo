import React from "react";
import ClickableIcon from '../../styles/ClickableIcon';

interface BackArrowProps {
  onClick?: () => void;
}

const BackArrow: React.FC<BackArrowProps> = ({ onClick }) => (
  <ClickableIcon 
    width="40px"
    height="40px"
    viewBox="0 0 40 41" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    onClick={onClick}
  >
    <path
      d="M16.25 23L10 16.75M10 16.75L16.25 10.5M10 16.75H18C22.2 16.75 24.3 16.75 25.9 17.5625C27.3126 18.2876 28.4624 19.4374 29.1875 20.85C30 22.45 30 24.55 30 28.75V30.5"
      stroke="#2D2D2D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </ClickableIcon>
);

export default BackArrow;
