import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::after, *::before {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  * {
   scroll-behavior: smooth;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  html {
    @media (max-width: 1440px) {
      font-size: 93.75%;
    }
  }
  input, button, textarea {
    font-family: inherit;
  }
  body {
    text-rendering: optimizeLegibility;
    background: #ffffff;
    color: ${({ theme }) => theme.colors.black};
  }
  button {
    cursor: pointer;
  }
`;


interface FlexProps {
  $height?: string;
  $width?: string;
  $direction?: string;
  $wrap?: string;
  $gap?: string;
  $justify?: string;
  $align?: string;
  $padding?: string;
  $margin?: string;
}

export const Flex = styled.div<FlexProps>`
  display: flex;
  ${({ $direction }) =>
    $direction !== undefined ? `flex-direction: ${$direction}` : ''};
  ${({ $width }) => ($width !== undefined ? `width: ${$width}` : '')};
  ${({ $height }) => ($height !== undefined ? `height: ${$height}` : '')};
  ${({ $wrap }) => ($wrap !== undefined ? `flex-wrap: ${$wrap}` : '')};
  ${({ $gap }) => ($gap !== undefined ? `gap: ${$gap}` : '')};
  ${({ $justify }) =>
    $justify !== undefined ? `justify-content: ${$justify}` : ''};
  ${({ $align }) => ($align !== undefined ? `align-items: ${$align}` : '')};
  ${({ $padding }) => ($padding !== undefined ? `padding: ${$padding}` : '')};
  ${({ $margin }) => ($margin !== undefined ? `margin: ${$margin}` : '')};
`;

interface ImageProps {
  $minwidth?: string;
  $maxwidth?: string;
  $minheight?: string;
  $maxheight?: string;
}

export const Image = styled.img<ImageProps>`
  ${({ $minwidth }) =>
    $minwidth !== undefined ? `min-width: ${$minwidth}` : ''};
  ${({ $maxwidth }) =>
    $maxwidth !== undefined ? `max-width: ${$maxwidth}` : 'max-width: 100%'};
  ${({ $minheight }) =>
    $minheight !== undefined ? `min-height: ${$minheight}` : ''};
  ${({ $maxheight }) =>
    $maxheight !== undefined ? `max-height: ${$maxheight}` : ''};
`;

export const GlobalContainer = styled.div`
  max-width: 1166px;
  width: 100%;
  padding: 0;
  margin: 0 auto;
`;
