import styled from 'styled-components';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  gap: 1rem;
`;

export const SubmitButton = styled(ButtonPrimary)`
  height: 2rem;
`;

export const ErrorMessage = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #DE3737;
`;
