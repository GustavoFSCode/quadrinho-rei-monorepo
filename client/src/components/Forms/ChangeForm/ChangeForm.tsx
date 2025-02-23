/* eslint-disable prettier/prettier */
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import handleError from '@/utils/handleToast';
import Input from '@/components/Inputs/Input/Input';
import { Flex } from '@/styles/global';
import { ChangeySchema, IChangeForm } from '@/validations/LoginSchema';
import ModalSuccess from '@/components/Modals/ModalSuccess/ModalSuccess';
import {
  Container,
  FormContainer,
  SubmitButton,
  Title,
} from './styles';
import { useRouter } from 'next/navigation';

const ChangeForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IChangeForm>({
    resolver: yupResolver(ChangeySchema),
  });

  const onSubmit: SubmitHandler<IChangeForm> = async () => {
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
        maxheight='16rem'
        maxwidth='22rem'
        text="Senha alterada com sucesso!"
        solidButton={{ text: 'Voltar', action: () => router.push('/') }} />
      )}
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <Flex $direction="column" $gap="0.625rem">
            <Input
              id="password"
              label="Nova senha"
              type="password"
              placeholder="Senha"
              {...register('password')}
              error={errors?.password?.message}
            />
            <Input
              id="confirm_password"
              label="Confirmar nova senha"
              type="password"
              placeholder="Confirme a senha"
              {...register('confirmPassword')}
              error={errors?.confirmPassword?.message}
            />
        </Flex>

          <SubmitButton type="submit" disabled={isSubmitting}>
            Alterar senha
          </SubmitButton>
      </FormContainer>
    </Container>
  );
};

export default ChangeForm;
