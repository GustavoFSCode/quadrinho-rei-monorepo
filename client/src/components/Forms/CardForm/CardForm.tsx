// components/Forms/CardForm/CardForm.tsx
import React from 'react';
import {
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
  useWatch
} from 'react-hook-form';
import { IRegisterForm } from '@/validations/RegisterSchema';
import Input from '@/components/Inputs/Input/Input';
import { maskCreditCard, getCardFlag } from '@/utils/masks';

interface CardFormProps {
  control: Control<IRegisterForm>;
  register: UseFormRegister<IRegisterForm>;
  errors: FieldErrors<IRegisterForm>;
}

const CardForm: React.FC<CardFormProps> = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Cards'
  });

  // Obtém os valores de todos os cartões de uma só vez
  const cards = useWatch({ control, name: 'Cards' });

  return (
    <div>
      <h3>Dados do Cartão</h3>
      {fields.map((field, index) => {
        const cardNumber = cards && cards[index] ? cards[index].numberCard : '';
        const computedCardFlag = getCardFlag(cardNumber || '');
        return (
          <div
            key={field.id}
            style={{
              marginBottom: '1rem',
              border: '1px solid #eee',
              padding: '1rem'
            }}
          >
            <Input
              id={`Cards[${index}].holderName`}
              label="Nome do Titular"
              placeholder="Nome do Titular"
              {...register(`Cards.${index}.holderName` as const)}
              error={errors?.Cards && errors.Cards[index]?.holderName?.message}
            />
            <Input
              id={`Cards[${index}].numberCard`}
              label="Número do Cartão"
              placeholder="xxxx.xxxx.xxxx.xxxx"
              maskFunction={maskCreditCard}
              {...register(`Cards.${index}.numberCard` as const)}
              error={errors?.Cards && errors.Cards[index]?.numberCard?.message}
            />
            {/* Campo para exibir a bandeira automaticamente */}
            <Input
              id={`Cards[${index}].flagCard`}
              label="Bandeira do Cartão"
              placeholder="Bandeira do Cartão"
              value={computedCardFlag}
              readOnly
            />
            <Input
              id={`Cards[${index}].safeNumber`}
              label="Código de Segurança"
              placeholder="123"
              {...register(`Cards.${index}.safeNumber` as const)}
              error={errors?.Cards && errors.Cards[index]?.safeNumber?.message}
            />
            {/* Renderiza o botão de remover somente se houver mais de 1 cartão */}
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)}>
                Remover Cartão
              </button>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() =>
          append({
            holderName: '',
            numberCard: '',
            flagCard: '',
            safeNumber: ''
          })
        }
      >
        Adicionar Cartão
      </button>
    </div>
  );
};

export default CardForm;
