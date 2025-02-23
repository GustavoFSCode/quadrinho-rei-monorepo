import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTheme } from 'styled-components';
import { Button } from './styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  width?: string;
  maxwidth?: string;
  height?: string;
  children: ReactNode;
}

const ButtonOutlineSuccess = ({
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
      $border={`border: 0.125rem solid ${theme.colors.alert3}`}
      color={theme.colors.alert3}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ButtonOutlineSuccess;
