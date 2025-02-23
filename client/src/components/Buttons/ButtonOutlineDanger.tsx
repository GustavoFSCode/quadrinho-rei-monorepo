import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTheme } from 'styled-components';
import { Button } from './styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  width?: string;
  maxwidth?: string;
  height?: string;
  children: ReactNode;
}

const ButtonOutlineDanger = ({
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
      $backgroundcolor={theme.colors.neutral1}
      $border={`0.125rem solid ${theme.colors.alert1}`}
      $textcolor={theme.colors.alert1}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ButtonOutlineDanger;
