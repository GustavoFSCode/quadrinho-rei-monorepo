import styled from 'styled-components';

interface ButtonProps {
  $backgroundcolor?: string;
  $hoveredbackgroundcolor?: string;
  $border?: string;
  $textcolor?: string;
  $width?: string;
  $maxwidth?: string;
  $height?: string;
  $size?: string;
  $boxshadow?: string;
}

export const Button = styled.button<ButtonProps>`
  font-size:  ${({ $size }) => ($size !== undefined ? $size : '1.1rem')};
  font-weight: 500;
  width: ${({ $width }) => ($width !== undefined ? $width : '100%')};
  min-height: ${({ $height }) =>
    $height !== undefined ? $height : '2.4375rem'};
  text-align: center;
  transition: all 0.5s ease-in-out;
  padding: 0.625rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  ${({ $backgroundcolor }) =>
    $backgroundcolor !== undefined
      ? `background-color: ${$backgroundcolor}`
      : ''};
  ${({ $border }) =>
    $border !== undefined ? `border: ${$border}` : 'border: none'};
  ${({ $textcolor, theme }) =>
    $textcolor !== undefined
      ? `color: ${$textcolor}`
      : `color: ${theme.colors.neutral1}`};
  ${({ $maxwidth }) =>
    $maxwidth !== undefined ? `max-width: ${$maxwidth}` : ''};
  ${({ $boxshadow }) =>
    $boxshadow !== undefined ? `box-shadow: ${$boxshadow}` : ''};

  &:hover {
    ${({ $hoveredbackgroundcolor }) =>
      $hoveredbackgroundcolor !== undefined
        ? `background: ${$hoveredbackgroundcolor}`
        : ''};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral3};
    color: ${({ theme }) => theme.colors.neutral4};
  }
`;
