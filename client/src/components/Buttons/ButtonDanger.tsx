import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTheme } from 'styled-components';
import { Button } from './styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  width?: string;
  maxwidth?: string;
  height?: string;
  children: ReactNode;
}

const ButtonDanger = ({
  width,
  maxwidth,
  height,
  children,
  ...rest
}: Props) => {
  const theme = useTheme();
  return (
    <Button
      $width={width}
      $maxwidth={maxwidth}
      $height={height}
      $backgroundcolor={theme.colors.primary7}
      $hoveredbackgroundcolor={`linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), ${theme.colors.primary7};`}
      color={theme.colors.neutral1}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ButtonDanger;
