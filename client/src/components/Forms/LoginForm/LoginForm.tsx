"use client";
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

// Importe o serviço de login
import { login } from '@/services/authService';

const LoginForm = () => {
  const router = useRouter();
  const { setUser } = useAuth(); // se você estiver usando algum contexto para armazenar o usuário
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginForm>({
    resolver: yupResolver(LoginSchema),
  });

  // Função de submit
  const onSubmit: SubmitHandler<ILoginForm> = async (formData) => {
    try {
      setIsSubmitting(true);

      // formData.email -> vira 'identifier'
      // formData.password -> vira 'password'
      const { jwt, user } = await login(formData.email, formData.password);

      // Salva o token e o user no localStorage (ou sessionStorage)
      localStorage.setItem(localStorageKeys.accessToken, jwt);
      localStorage.setItem(localStorageKeys.user, JSON.stringify(user));

      // Caso Strapi retorne refreshToken, você pode armazená-lo aqui também
      // localStorage.setItem(localStorageKeys.refreshToken, data.refreshToken);

      // Se estiver usando um contexto global (ex: Redux ou useAuth), você pode setar o user
      setUser({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      // Redireciona para a rota de clientes
      router.push('/clientes');
    } catch (error) {
      handleError(error); // ou exibir mensagem de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <Flex $direction="column" $gap="0.9375rem" $padding='1rem 0 0 0' $width='420px'>
          <Input
            id="email"
            label="E-mail"
            hover={true}
            placeholder="Insira o e-mail"
            {...register('email')}
            error={errors?.email?.message}
          />

          <Input
            id="password"
            label="Senha"
            hover={true}
            type="password"
            placeholder="Insira a senha"
            {...register('password')}
            error={errors?.password?.message}
          />
        </Flex>

        <Flex $direction="column" $gap="1.375rem" $align="center">
          <SubmitButton size='1.18rem' type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </SubmitButton>
        </Flex>
      </FormContainer>
    </Container>
  );
};

export default LoginForm;
