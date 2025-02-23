import React, { CSSProperties, ReactNode } from 'react';
import { StyledButton } from './styled';

interface ButtonProps {
  width?: string;
  weight?: string;
  height?: string;
  text: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  variant: 'purple' | 'red' | 'green' | 'outline' | 'disabled';
  type: 'button' | 'submit' | 'reset';
  className?: string; 
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  width,
  weight,
  height,
  text,
  onClick,
  style,
  variant,
  type,
  className,
  disabled = false
}) => {
  return (
    <StyledButton
      width={width}
      weight={weight}
      height={height}
      onClick={onClick}
      style={style}
      variant={variant}
      type={type}
      className={className}
      disabled={disabled}
    >
      {text}
    </StyledButton>
  );
};

export default Button;
