import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import Link from 'next/link';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 1.25rem;
`;

export const FormContainer = styled.form`
  height: 100%;
  max-width: 34.125rem;
  border-radius: 20px;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 1.5rem;
`;

export const LinkText = styled.a`
  font-size: 0.875rem;
  font-weight: 400;
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral4};
`;

export const Strong = styled.strong`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary10};
  cursor: pointer;
`;

export const SubmitButton = styled(ButtonPrimary)`
  height: 2.8125rem;
`;

export const StyledLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.primary10};
`;

export const BackButton = styled.button`
  all: unset;
  background-image: url('/img/back_icon.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  transition: background-image 0.5s ease-in-out;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const ErrorMessage = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #DE3737;
`;
