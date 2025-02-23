import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 1.25rem;
`;

export const FormContainer = styled.form`
  height: 100%;
  max-width: 28.125rem;
  width: 100%;
  display: flex;
  justify-content: start;
  flex-direction: column;
  gap: 3.125rem;
`;

interface Props {
  $size?: string;
}

export const LinkText = styled.a<Props>`
  font-size: ${({ $size }) => ($size !== undefined ? $size : '0.875rem')};
  font-weight: 400;
  text-align: center;
  color: #747373;
`;

export const Span = styled.span`
  font-size: 14px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.primary9};
  cursor: pointer;
`;

export const Strong = styled.strong<Props>`
  font-size: ${({ $size }) => ($size !== undefined ? $size : '0.875rem')};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.primary9};
  cursor: pointer;
`;

export const SubmitButton = styled(ButtonPrimary)`
  height: 2.8125rem;
  width: 160px;
`;
