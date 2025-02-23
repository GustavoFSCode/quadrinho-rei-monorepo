import { Image } from '@/styles/global';
import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
`;

interface ImageContainerProps {
  $hasimage: boolean;
}

export const ImageContainer = styled.label<ImageContainerProps>`
  position: relative;
  display: block;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.neutral3};

  ${({ $hasimage }) =>
    $hasimage
      ? `
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background-image: url('/img/plus.svg');
    background-repeat: no-repeat;
    background-size: 20px;
    background-position: center;
  }

  `
      : ''}
`;

export const StyledImage = styled(Image)`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: 50%;
  z-index: 1;
`;

export const StyledInput = styled.input`
  display: none;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.colors.neutral2};
  border-radius: 50%;
  background-color: transparent;
  background-image: url('/img/close3.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 10px;
`;
