import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTheme } from 'styled-components';
import { Button } from './styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  width?: string;
  maxwidth?: string;
  height?: string;
  children: ReactNode;
}

const ButtonOutlinePrimary = ({
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
      $backgroundcolor="transparent"
      $border={`0.2rem solid ${theme.colors.secondary5}`}
      $textcolor={theme.colors.alert5}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ButtonOutlinePrimary;
