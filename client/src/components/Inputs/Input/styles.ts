import styled from 'styled-components';
import { Flex, Image } from '@/styles/global';
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
  color: ${({ theme }) => theme.colors.neutral4};
`;

export const InputContainer = styled.div`
  position: relative;
`;

interface StyledInputProps {
  $paddingright?: string;
  $paddingleft?: string;
  $hover?: boolean;
  $width?: string;
}

export const StyledInput = styled(MaskedInput)<StyledInputProps>`
  width: ${({ $width }) => ($width ? $width : '100%')};
  padding: 0.7813rem 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.neutral2};
  background-color: ${({ theme }) => theme.colors.neutral1};
  font-size: 0.9375rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral6};
  border-radius: 0.5rem;
  padding-right: ${({ $paddingright }) =>
    $paddingright !== undefined ? $paddingright : '1.25rem'};
  padding-left: ${({ $paddingleft }) =>
    $paddingleft !== undefined ? $paddingleft : '1.25rem'};

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral3};
    font-size: 0.975rem;
  }

  ${({ $hover }) =>
    $hover &&
    `
      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.30);
      }
    `}
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
    $show ? 'url(/assets/images/eye-grey.svg)' : 'url(/assets/images/eye-green.svg)'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  transition: background-image 0.5s ease-in-out;
`;

export const Small = styled.small`
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral2};
`;

export const ErrorMessage = styled.span`
  margin-top: 5px;
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.alert1};
`;

export const Lock = styled(Image)`
  position: absolute;
  width: 20px;
  height: 20px;
  object-fit: contain;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
`;

export const Search = styled(Image)`
  position: absolute;
  width: 18px;
  height: 18px;
  object-fit: contain;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
`;

export const Edit = styled.button`
  all: unset;
  position: absolute;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  background-image: url('/img/edit2.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  width: 1.25rem;
  height: 1.25rem;
`;
