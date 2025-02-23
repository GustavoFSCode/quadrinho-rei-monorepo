import styled from 'styled-components';
import { Flex } from '@/styles/global';
import MaskedInput from '../MaskedInput/MaskedInput';

interface StyledFlexProps {
  $maxwidth?: string;
}

export const StyledFlex = styled(Flex)<StyledFlexProps>`
  max-width: none;
  @media (min-width: 992px) {
    ${({ $maxwidth }) =>
      $maxwidth !== undefined ? `max-width: ${$maxwidth}` : ''};
  }
`;

export const Label = styled.label`
  font-size: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral6};
`;

export const InputContainer = styled.div`
  position: relative;
`;

export const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.7813rem 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.neutral3};
  background-color: ${({ theme }) => theme.colors.neutral1};
  font-size: 0.9375rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral6};
  border-radius: 1.5rem;
  resize: none;
  height: 200px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral3};
    font-size: 0.875rem;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

interface ShowPasswordButtonProps {
  $show: boolean;
}

export const ShowPasswordButton = styled.button<ShowPasswordButtonProps>`
  all: unset;
  position: absolute;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  background-image: ${({ $show }) =>
    $show ? 'url(/img/showEye.svg)' : 'url(/img/hiddenEye.svg)'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  width: 1.25rem;
  height: 1.25rem;
  transition: background-image 0.5s ease-in-out;
`;

export const Small = styled.small`
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral4};
`;

export const ErrorMessage = styled.span`
  margin-top: 5px;
  font-size: 8pt;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.alert1};
`;
