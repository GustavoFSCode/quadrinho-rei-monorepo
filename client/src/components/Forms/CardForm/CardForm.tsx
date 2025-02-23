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

  // States para controlar modais
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [dangerMessage, setDangerMessage] = useState('');
  const [cardIndexToRemove, setCardIndexToRemove] = useState<number | null>(null);

  /**
   * Ao clicar no toggle:
   * - Se 'isActive' estiver false -> ativa e desativa os outros
   * - Se 'isActive' estiver true -> Se for o único favorito, não desativa?
   *   (ajuste se quiser permitir todos não-favoritos)
   */
  function handleToggleFavorite(index: number) {
    const currentFavorite = cards[index].isFavorite;
    // Se o toggle estava desativado e o usuário clicou para ativar
    if (!currentFavorite) {
      // Desativa todos os outros e ativa somente este
      cards.forEach((_, i) => {
        setValue(`Cards.${i}.isFavorite`, i === index);
      });
    } else {
      // Se já estava ativo, decide se permite "nenhum favorito" ou não.
      // Se não quiser permitir "0 favoritos", não faça nada.
      // Se quiser permitir, basta setValue(`Cards.${index}.isFavorite`, false).
      // Vou deixar o padrão anterior (não permite 0).
      // Então, se for o único cartão, não desativa:
      if (cards.length === 1) return;
      // Senão, desativa e ativa algum outro (por ex., o seguinte):
      setValue(`Cards.${index}.isFavorite`, false);
      const nextIndex = index + 1 < cards.length ? index + 1 : 0;
      setValue(`Cards.${nextIndex}.isFavorite`, true);
    }
  }

  // Atualiza automaticamente a bandeira do cartão
  useEffect(() => {
    cards.forEach((card, index) => {
      const computedFlag = getCardFlag(card.numberCard || '');
      if (card.flagCard !== computedFlag) {
        setValue(`Cards.${index}.flagCard`, computedFlag);
      }
    });
  }, [cards, setValue]);

  // Garante pelo menos 1 favorito se houver cartões
  useEffect(() => {
    const favoriteCount = cards.filter(card => card.isFavorite).length;
    if (favoriteCount === 0 && cards.length > 0) {
      setValue(`Cards.0.isFavorite`, true);
    }
  }, [cards, setValue]);

  // ==========================
  // Ações de salvar / remover
  // ==========================
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
    // Exibir modal de confirmação
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

  // ======================
  // Render
  // ======================
  return (
    <Flex $direction="column">
      {/* Modal de sucesso */}
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

      {/* Modal Danger (remoção) */}
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
        const isExistingCard = (cards[index]?.cardId != null);
        const cardNumber = cards[index]?.numberCard || '';
        // Bandeira calculada
        const computedCardFlag = getCardFlag(cardNumber);

        return (
          <Flex
            $direction="column"
            $gap="1rem"
            key={field.id}
            style={{ marginBottom: '1rem', border: '1px solid #eee', padding: '1rem' }}
          >
            <h4>Cartão {index + 1}</h4>

            {/* Se o cartão é existente, readOnly = true (exceto toggle). Caso contrário, false */}
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

            {/* Campo bandeira (sempre readOnly) */}
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

            {isFromModal && (
              isExistingCard ? (
                // Botão "Salvar mudança" (PUT)
                <SubmitButton
                  type="button"
                  onClick={() => handleSaveExistingCard(index)}
                  style={{ marginTop: '1rem' }}
                >
                  Salvar mudança
                </SubmitButton>
              ) : (
                // Botão "Salvar novo cartão" (POST)
                <SubmitButton
                  type="button"
                  onClick={() => handleSaveNewCard(index)}
                  style={{ marginTop: '1rem' }}
                >
                  Salvar novo cartão
                </SubmitButton>
              )
            )}

            {/* Renderiza o botão de remover sempre que quiser permitir excluir */}
            {fields.length > 1 && (
              <SubmitButton
                type="button"
                onClick={() => handleRemoveClick(index)}
                style={{ backgroundColor: '#d9534f' }}
              >
                Remover Cartão
              </SubmitButton>
            )}
          </Flex>
        );
      })}

      {/* Botão para adicionar novo cartão */}
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
