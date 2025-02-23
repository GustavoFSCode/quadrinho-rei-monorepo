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

  const onSubmit: SubmitHandler<ILoginForm> = async () => {
    try {
      setIsSubmitting(true);

      setUser({ id: 1, username: 'Admin', email: 'GoAdmin@gmail.com' });

      localStorage.setItem(localStorageKeys.accessToken, '123');
      localStorage.setItem(
        localStorageKeys.user,
        JSON.stringify({
          id: 1,
          username: 'Admin',
          email: 'QuadrinhosRei@gmail.com',
        }),
      );
      localStorage.setItem(localStorageKeys.refreshToken, '123');

      router.push('/clientes');
    } catch (error) {
      handleError(error);
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
            Entrar
          </SubmitButton>

        </Flex>
      </FormContainer>

    </Container>
  );
};

export default LoginForm;
