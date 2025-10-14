import * as yup from 'yup';

export const PromotionalCouponSchema = yup.object().shape({
  title: yup
    .string()
    .required('Título do cupom é obrigatório')
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(50, 'Título deve ter no máximo 50 caracteres'),

  usageLimit: yup
    .number()
    .required('Quantidade de utilizações é obrigatória')
    .positive('Quantidade deve ser maior que zero')
    .integer('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade mínima é 1')
    .max(10000, 'Quantidade máxima é 10000'),

  price: yup
    .number()
    .required('Valor do cupom é obrigatório')
    .positive('Valor deve ser maior que zero')
    .min(0.01, 'Valor mínimo é R$ 0,01')
    .max(100000, 'Valor máximo é R$ 100.000,00')
});

export type IPromotionalCouponForm = yup.InferType<typeof PromotionalCouponSchema>;
