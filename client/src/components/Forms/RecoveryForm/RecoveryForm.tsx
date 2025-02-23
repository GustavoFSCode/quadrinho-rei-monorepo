// RecoveryForm.tsx
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IRecoveryForm, RecoverySchema } from '@/validations/LoginSchema';
import { useState } from 'react';
import handleError from '@/utils/handleToast';
import Input from '@/components/Inputs/Input/Input';
import { Flex } from '@/styles/global';
import ModalSuccess from '@/components/Modals/ModalSuccess/ModalSuccess';
import {
  Container,
  FormContainer,
  SubmitButton,
  BackButton,
  ButtonBox,
} from './styles';
import { useRouter } from 'next/navigation';
import ButtonOutlinePrimary from '@/components/Buttons/ButtonOutlinePrimary';

const RecoveryForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IRecoveryForm>({
    resolver: yupResolver(RecoverySchema),
  });

  const onSubmit: SubmitHandler<IRecoveryForm> = async () => {
    try {
      setIsSubmitting(true);
      setShowModal(true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      {showModal && (
        <ModalSuccess
          maxwidth="20.375rem"
          maxheight="19.75rem"
          text={"Link enviado com sucesso!"}
          subText={'Um link com a recuperação da senha foi enviado para o e-mail informado'}
          solidButton={{ text: 'Voltar', action: () =>  router.push('/redefinir-senha') }}
        />
      )}
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <Flex $direction="column" $gap="1.25rem">
          <Input
            id="email"
            autoComplete="email"
            label="E-mail"
            type="email"
            placeholder="Insira o email"
            {...register('email')}
            error={errors?.email?.message}
          />
        </Flex>
        <ButtonBox>
          <SubmitButton type="submit" disabled={isSubmitting}>
            Continuar
          </SubmitButton>
          <ButtonOutlinePrimary type="button" onClick={() => router.push('/')}>
            Voltar
          </ButtonOutlinePrimary>
        </ButtonBox>
      </FormContainer>
    </Container>
  );
};

export default RecoveryForm;
