// validations/RegisterSchema.ts
import * as yup from 'yup';

export const RegisterSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Formato inválido').required('E-mail é obrigatório'),
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
  birthDate: yup
    .date()
    .typeError('Data inválida')
    .required('Data de nascimento é obrigatória'),
  gender: yup.string().required('Gênero é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  typePhone: yup.string().required('Tipo de telefone é obrigatório'),
  ranking: yup.number().required('Ranking é obrigatório'),
  Address: yup
    .array()
    .of(
      yup.object({
        nameAddress: yup.string().required('Nome do endereço é obrigatório'),
        TypeAddress: yup.string().required('Tipo de endereço é obrigatório'),
        typeLogradouro: yup.string().required('Tipo de logradouro é obrigatório'),
        nameLogradouro: yup.string().required('Nome do logradouro é obrigatório'),
        number: yup.string().required('Número é obrigatório'),
        neighborhood: yup.string().required('Bairro é obrigatório'),
        cep: yup.string().required('CEP é obrigatório'),
        city: yup.string().required('Cidade é obrigatória'),
        state: yup.string().required('Estado é obrigatório'),
        country: yup.string().required('País é obrigatório'),
        observation: yup.string(),
      })
    )
    .min(2, 'É necessário pelo menos 2 endereços')
    .test(
      'endereco-tipo',
      'É necessário pelo menos um endereço de Cobrança e um de Entrega',
      (addresses = []) => {
        const hasCobranca = addresses.some(addr => addr.TypeAddress === 'Cobrança');
        const hasEntrega = addresses.some(addr => addr.TypeAddress === 'Entrega');
        return hasCobranca && hasEntrega;
      }
    ),
  Cards: yup.array().of(
    yup.object({
      holderName: yup.string().required('Nome do titular é obrigatório'),
      numberCard: yup.string().required('Número do cartão é obrigatório'),
      flagCard: yup.string().required('Bandeira do cartão é obrigatória'),
      safeNumber: yup.string().required('Código de segurança é obrigatório'),
      isFavorite: yup.boolean().required(),
    })
  )
});

export type IRegisterForm = yup.InferType<typeof RegisterSchema>;
