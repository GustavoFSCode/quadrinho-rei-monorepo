// RecoveryForm/styles.ts
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1; /* Permite que o container cresça para ocupar o espaço disponível */
  width: 100%;
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1; /* Ocupa o espaço restante dentro do Container */
  width: 100%;
`;

export const SubmitButton = styled(ButtonPrimary)`
  height: 2.8125rem;
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
  transition: background-image 0.5s ease-in-out;
  border-radius: 50%;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto; /* Empurra o ButtonBox para o final do FormContainer */
`;

export const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

export const Strong = styled.p`
  font-size: 24px;
  font-weight: 500;
  color: #454545;
`;

export const P = styled.p`
  font-size: 17px;
  font-weight: 400;
  color: #747373;
  text-align: center;
`;
