import { unformatCurrency } from '@/utils/masks';
import * as yup from 'yup';

export const ComicSchema = yup.object({
  title: yup.string().required('Título é obrigatório'),
  author: yup.string().required('Autor é obrigatório'),
  publisher: yup.string().required('Editora é obrigatória'),
  year: yup
    .number()
    .typeError('Ano deve ser um número')
    .required('Ano é obrigatório')
    .min(1900, 'Ano inválido')
    .max(new Date().getFullYear(), 'Ano inválido'),
  issue: yup.string().required('Número da issue é obrigatório'),
  edition: yup.string().optional(),
  pages: yup
    .number()
    .typeError('Número de páginas deve ser um número')
    .required('Número de páginas é obrigatório')
    .min(1, 'Deve ter pelo menos 1 página'),
  synopsis: yup.string().required('Sinopse é obrigatória'),
  category: yup
    .array()
    .of(yup.string().required('Cada categoria deve ser preenchida'))
    .min(1, 'Selecione pelo menos uma categoria')
    .defined(), // Garante que o array não seja undefined
  isbn: yup.string().required('ISBN é obrigatório'),
  pricingGroup: yup.string().required('Grupo de precificação é obrigatório'),
  barcode: yup.string().required('Código de barras é obrigatório'),
  dimensions: yup.object({
    height: yup
      .number()
      .typeError('Altura deve ser um número')
      .required('Altura é obrigatória')
      .min(1, 'Valor inválido'),
    width: yup
      .number()
      .typeError('Largura deve ser um número')
      .required('Largura é obrigatória')
      .min(1, 'Valor inválido'),
    weight: yup
      .number()
      .typeError('Peso deve ser um número')
      .required('Peso é obrigatório')
      .min(1, 'Valor inválido'),
    depth: yup
      .number()
      .typeError('Profundidade deve ser um número')
      .required('Profundidade é obrigatória')
      .min(1, 'Valor inválido'),
  }),
  price: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        return unformatCurrency(originalValue);
      }
      return value;
    })
    .typeError('Preço deve ser um número')
    .required('Preço é obrigatório')
    .min(0.01, 'Preço deve ser positivo'),
  stock: yup
    .number()
    .typeError('Estoque deve ser um número')
    .required('Estoque é obrigatório')
    .min(0, 'Estoque deve ser positivo'),
  active: yup.boolean().required(),
  inactivationReason: yup.string().when(['active'], ([active], schema) =>
    active === false ? schema.required('Motivo de inativação é obrigatório') : schema.notRequired()
  )
});
