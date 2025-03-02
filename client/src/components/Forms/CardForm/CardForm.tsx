// CardForm.tsx
import React, { useState, useEffect } from 'react';
import {
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
  useWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { IRegisterForm } from '@/validations/RegisterSchema';
import Input from '@/components/Inputs/Input/Input';
import { maskCreditCard, getCardFlag } from '@/utils/masks';
import { SubmitButton } from './styled';
import { Flex } from '@/styles/global';
import { LabelStyled } from '../stylesForm';
import ToggleButton from '@/components/Button/ToggleButton';

// IMPORTS DOS MODAIS
import ModalSuccess from '@/components/Modals/ModalSuccess/ModalSuccess';
import ModalDanger from '@/components/Modals/ModalDanger/ModalDanger';

interface CardFormProps {
  control: Control<IRegisterForm>;
  register: UseFormRegister<IRegisterForm>;
  errors: FieldErrors<IRegisterForm>;
  setValue: UseFormSetValue<IRegisterForm>;
  /**
   * Se isFromModal = true, exibimos botões individuais de "Salvar" (PUT/POST)
   */
  isFromModal?: boolean;
}

const CardForm: React.FC<CardFormProps> = ({
  control,
  register,
  errors,
  setValue,
  isFromModal = false
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Cards'
  });

  // Lista de cartões em tempo real
  const cards = useWatch({ control, name: 'Cards' }) || [];
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [dangerMessage, setDangerMessage] = useState('');
  const [cardIndexToRemove, setCardIndexToRemove] = useState<number | null>(null);

  function handleToggleFavorite(index: number) {
    const currentFavorite = cards[index].isFavorite;
    if (!currentFavorite) {
      cards.forEach((_, i) => {
        setValue(`Cards.${i}.isFavorite`, i === index);
      });
    } else {
      if (cards.length === 1) return;
      setValue(`Cards.${index}.isFavorite`, false);
      const nextIndex = index + 1 < cards.length ? index + 1 : 0;
      setValue(`Cards.${nextIndex}.isFavorite`, true);
    }
  }

  useEffect(() => {
    cards.forEach((card, index) => {
      const computedFlag = getCardFlag(card.numberCard || '');
      if (card.flagCard !== computedFlag) {
        setValue(`Cards.${index}.flagCard`, computedFlag);
      }
    });
  }, [cards, setValue]);

  useEffect(() => {
    const favoriteCount = cards.filter(card => card.isFavorite).length;
    if (favoriteCount === 0 && cards.length > 0) {
      setValue(`Cards.0.isFavorite`, true);
    }
  }, [cards, setValue]);

  const handleSaveExistingCard = (index: number) => {
    const card = cards[index];
    console.log('PUT no cartão existente =>', card);
    setSuccessMessage('Alteração no cartão salva com sucesso!');
    setShowSuccessModal(true);
  };

  const handleSaveNewCard = (index: number) => {
    const card = cards[index];
    console.log('POST de novo cartão =>', card);
    setSuccessMessage('Novo cartão cadastrado com sucesso!');
    setShowSuccessModal(true);
  };

  const handleRemoveClick = (index: number) => {
    setCardIndexToRemove(index);
    setDangerMessage('Deseja realmente remover este cartão?');
    setShowDangerModal(true);
  };

  const confirmRemoveCard = () => {
    if (cardIndexToRemove != null) {
      remove(cardIndexToRemove);
    }
    setShowDangerModal(false);
    setCardIndexToRemove(null);
  };

  return (
    <Flex $direction="column">
      {showSuccessModal && (
        <ModalSuccess
          maxwidth="20rem"
          maxheight="20rem"
          text={successMessage}
          subText=""
          solidButton={{
            text: 'Ok',
            action: () => setShowSuccessModal(false)
          }}
        />
      )}

      {showDangerModal && (
        <ModalDanger
          maxwidth="20rem"
          maxheight="20rem"
          text={dangerMessage}
          outlineButton={{
            text: 'Não',
            action: () => setShowDangerModal(false)
          }}
          solidButton={{
            text: 'Sim',
            action: confirmRemoveCard
          }}
        />
      )}

      <h3>Dados do Cartão</h3>
      {fields.map((field, index) => {
        // Considere que se cardId ou id existir, o cartão já foi cadastrado.
        const isExistingCard = (cards[index]?.cardId != null || cards[index]?.id != null);
        const cardNumber = cards[index]?.numberCard || '';
        const computedCardFlag = getCardFlag(cardNumber);

        return (
          <Flex
            $direction="column"
            $gap="1rem"
            key={field.id}
            style={{ marginBottom: '1rem', border: '1px solid #eee', padding: '1rem' }}
          >
            <h4>Cartão {index + 1}</h4>
            <Input
              id={`Cards[${index}].holderName`}
              label="Nome do Titular"
              placeholder="Nome do Titular"
              readOnly={isExistingCard}
              {...register(`Cards.${index}.holderName` as const)}
              error={errors?.Cards && errors.Cards[index]?.holderName?.message}
            />
            <Input
              id={`Cards[${index}].numberCard`}
              label="Número do Cartão"
              placeholder="1111.2222.3333.4444"
              maskFunction={maskCreditCard}
              readOnly={isExistingCard}
              {...register(`Cards.${index}.numberCard` as const)}
              error={errors?.Cards && errors.Cards[index]?.numberCard?.message}
            />
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
              readOnly={isExistingCard}
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
            {/* Renderiza o botão de salvar somente para cartões novos */}
            {isFromModal && !isExistingCard && (
              <SubmitButton
                type="button"
                onClick={() => handleSaveNewCard(index)}
                style={{ marginTop: '1rem' }}
              >
                Salvar novo cartão
              </SubmitButton>
            )}
            {fields.length > 1 && (
              <SubmitButton
                type="button"
                onClick={() => handleRemoveClick(index)}
                style={{ marginTop: '1rem', backgroundColor: '#d9534f' }}
              >
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
            cardId: null, // indica que é um cartão novo
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
