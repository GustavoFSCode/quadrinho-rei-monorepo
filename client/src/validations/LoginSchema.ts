import * as yup from 'yup';

export type ILoginForm = yup.InferType<typeof LoginSchema>;

export const LoginSchema = yup.object({
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('Insira um e-mail válido'),
  password: yup
    .string()
    .min(6, 'Mínimo de 6 digitos')
    .required('Senha é obrigatória'),
});

export type IRecoveryForm = yup.InferType<typeof RecoverySchema>;

export const RecoverySchema = yup.object({
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('Insira um e-mail válido'),
});

export type IChangeForm = yup.InferType<typeof ChangeySchema>;

export const ChangeySchema = yup.object({
    password: yup
      .string()
      .required('Senha é obrigatória')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
        'A senha deve ter no mínimo 8 caracteres, incluindo 1 letra maiúscula, 1 minúscula e 1 caractere especial'
      ),
    confirm_password: yup
      .string()
      .oneOf([yup.ref('password')], 'As senhas devem coincidir')
      .required('Confirmação de senha é obrigatória'),
});
