import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTheme } from 'styled-components';
import { Button } from './styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  width?: string;
  maxwidth?: string;
  height?: string;
  size?: string;
  children: ReactNode;
}

const ButtonPrimary = ({
  width,
  size,
  maxwidth,
  height,
  children,
  ...rest
}: Props) => {
  const theme = useTheme();
  return (
    <Button
      $width={width}
      $size={size}
      $maxwidth={maxwidth}
      $height={height}
      $backgroundcolor={theme.colors.alert5}
      $hoveredbackgroundcolor={`linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), ${theme.colors.alert6};`}
      color={theme.colors.neutral1}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ButtonPrimary;
