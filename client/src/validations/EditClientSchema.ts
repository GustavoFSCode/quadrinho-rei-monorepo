import * as yup from 'yup';

export const EditClientSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Formato inválido').required('E-mail é obrigatório'),
  birthDate: yup
    .date()
    .typeError('Data inválida')
    .required('Data de nascimento é obrigatória'),
  gender: yup.string().required('Gênero é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  typePhone: yup.string().required('Tipo de telefone é obrigatório'),
  ranking: yup.number().required('Ranking é obrigatório'),
});

export type IEditClientForm = yup.InferType<typeof EditClientSchema>;
