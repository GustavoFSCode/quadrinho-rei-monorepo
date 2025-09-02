'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ILoginForm, LoginSchema } from '@/validations/LoginSchema';
import { localStorageKeys } from '@/utils/localStorageKeys';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import handleError from '@/utils/handleToast';
import Input from '@/components/Inputs/Input/Input';
import { Flex } from '@/styles/global';
import {
  Container,
  FormContainer,
  SubmitButton,
} from './styles';

import { login } from '@/services/authService';
import { toast } from 'react-toastify';

const LoginForm = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginForm>({
    resolver: yupResolver(LoginSchema),
  });

  const onSubmit: SubmitHandler<ILoginForm> = async (formData) => {
    try {
      setIsSubmitting(true);

      const { jwt, user } = await login(
        formData.email,
        formData.password
      );

      // armazena token e user completo (incluindo documentId)
      localStorage.setItem(localStorageKeys.accessToken, jwt);
      localStorage.setItem(
        localStorageKeys.user,
        JSON.stringify(user)
      );

      // guarda também separadamente o documentId (opcional)
      localStorage.setItem(
        localStorageKeys.userDocumentId,
        user.documentId
      );

      // atualiza contexto global
      setUser({
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        email: user.email,
      });

      toast.success('Login realizado com sucesso!');
      router.push('/home');
    } catch (error) {

      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <Flex $direction="column" $gap="0.9375rem" $padding="1rem 0 0 0" $width="420px">
          <Input
            id="email"
            label="E-mail"
            placeholder="Insira o e-mail"
            hover
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="Insira a senha"
            hover
            {...register('password')}
            error={errors.password?.message}
          />
        </Flex>
        <Flex $direction="column" $gap="1.375rem" $align="center">
          <SubmitButton size="1.18rem" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </SubmitButton>
        </Flex>
      </FormContainer>
    </Container>
  );
};

export default LoginForm;
