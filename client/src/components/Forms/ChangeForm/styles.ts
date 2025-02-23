import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
`;

export const FormContainer = styled.form`
  height: 100%;
  max-width: 32.125rem;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 1.875rem;
`;

export const SubmitButton = styled(ButtonPrimary)`
  height: 2.8125rem;
`;

export const Title = styled.h1`
  font-family: 'Super Brain', sans-serif;
  font-weight: 400;
  text-align: center;
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary7};
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  -webkit-text-stroke: 1px ${({ theme }) => theme.colors.neutral1};

  @media (max-width: 1065px) {
    font-size: 1.4rem;
  }
`;
