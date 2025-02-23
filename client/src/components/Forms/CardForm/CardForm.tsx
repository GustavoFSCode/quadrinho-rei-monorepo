// components/Forms/CardForm/CardForm.tsx
import React, { useEffect } from 'react';
import {
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
  useWatch,
  useFormContext,
  UseFormSetValue
} from 'react-hook-form';
import { IRegisterForm } from '@/validations/RegisterSchema';
import Input from '@/components/Inputs/Input/Input';
import { maskCreditCard, getCardFlag } from '@/utils/masks';
import { SubmitButton } from './styled';
import { Flex } from '@/styles/global';
import { LabelStyled } from '../stylesForm';
import ToggleButton from '@/components/Button/ToggleButton';

interface CardFormProps {
  control: Control<IRegisterForm>;
  register: UseFormRegister<IRegisterForm>;
  errors: FieldErrors<IRegisterForm>;
  setValue: UseFormSetValue<IRegisterForm>;
}

const CardForm: React.FC<CardFormProps> = ({ control, register, errors, setValue }) => {

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Cards'
  });

  // Obtém os valores de todos os cartões de uma só vez
  const cards = useWatch({ control, name: 'Cards' }) || [];

function handleToggleFavorite(index: number) {
  const currentFavorite = cards[index].isFavorite;

  // Se existe apenas 1 cartão e ele já está favorito, não desativa
  if (cards.length === 1 && currentFavorite) {
    return;
  }

  if (currentFavorite) {
    // Está tentando desativar o favorito
    if (cards.length === 2) {
      // Se existem 2 cartões, desativa este e ativa o outro
      const otherIndex = index === 0 ? 1 : 0;
      setValue(`Cards.${index}.isFavorite`, false);
      setValue(`Cards.${otherIndex}.isFavorite`, true);
    } else {
      // Se existem mais de 2, desativa este e ativa o próximo (ou o primeiro, por exemplo)
      setValue(`Cards.${index}.isFavorite`, false);
      const nextIndex = index + 1 < cards.length ? index + 1 : 0;
      setValue(`Cards.${nextIndex}.isFavorite`, true);
    }
  } else {
    // Se o toggle estava desativado e o usuário clicou para ativar
    // Desativa todos os outros e ativa somente este
    cards.forEach((_, i) => {
      setValue(`Cards.${i}.isFavorite`, i === index);
    });
  }
}

  useEffect(() => {
    cards.forEach((card, index) => {
      const computedFlag = getCardFlag(card.numberCard || '');
      // Só atualiza se o valor da bandeira for diferente
      if (card.flagCard !== computedFlag) {
        setValue(`Cards.${index}.flagCard`, computedFlag);
      }
    });
  }, [cards, setValue]);

  useEffect(() => {
    const favoriteCount = cards.filter(card => card.isFavorite).length;

    // Se não existir nenhum favorito mas existir ao menos 1 cartão, marca o primeiro
    if (favoriteCount === 0 && cards.length > 0) {
      setValue(`Cards.0.isFavorite`, true);
    }
  }, [cards, setValue]);

  return (
    <Flex $direction="column">
      <h3>Dados do Cartão</h3>
      {fields.map((field, index) => {
        const cardNumber = cards && cards[index] ? cards[index].numberCard : '';
        const computedCardFlag = getCardFlag(cardNumber || '');
        return (
          <Flex $direction="column" $gap="1rem"
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
              placeholder="1111.2222.3333.4444"
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
              maxLength={3}
              {...register(`Cards.${index}.safeNumber` as const)}
              error={errors?.Cards && errors.Cards[index]?.safeNumber?.message}
            />
             <LabelStyled>
            Favorito
            <ToggleButton
              isActive={cards[index]?.isFavorite || false}
              onToggle={() => handleToggleFavorite(index)}
            />
          </LabelStyled>
            {/* Renderiza o botão de remover somente se houver mais de 1 cartão */}
            {fields.length > 1 && (
              <SubmitButton type="button" onClick={() => remove(index)}>
                Remover Cartão
              </SubmitButton>
            )}
          </Flex>
        );
      })}
      <SubmitButton
        type="button"
        onClick={() =>
          append({
            holderName: '',
            numberCard: '',
            flagCard: '',
            safeNumber: '',
            isFavorite: false
          })
        }
      >
        Adicionar Cartão
      </SubmitButton>
    </Flex>
  );
};

export default CardForm;
