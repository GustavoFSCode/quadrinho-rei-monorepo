import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '@/components/Inputs/Input/Input';
import ToggleButton from '@/components/Button/ToggleButton';
import { SubmitButton } from './styled';
import { Flex } from '@/styles/global';
import { toast } from 'react-toastify';
import { createCard } from '@/services/clientService';
import { maskCreditCard, getCardFlag } from '@/utils/masks';

interface CardFormData {
  holderName: string;
  numberCard: string;
  safeNumber: string;
  flagCard: string;
  isFavorite: boolean;
}

interface NewCardFormProps {
  clientDocumentId: string;
  onCardsRefresh?: () => void;
}

const cardSchema = yup.object().shape({
  holderName: yup.string().required('Nome do titular é obrigatório'),
  numberCard: yup.string().required('Número do cartão é obrigatório'),
  safeNumber: yup.string().required('Código de segurança é obrigatório'),
  flagCard: yup.string().required('Bandeira do cartão é obrigatória'),
  isFavorite: yup.boolean().default(false),
});

const NewCardForm: React.FC<NewCardFormProps> = ({
  clientDocumentId,
  onCardsRefresh,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CardFormData>({
    resolver: yupResolver(cardSchema),
    defaultValues: {
      holderName: '',
      numberCard: '',
      safeNumber: '',
      flagCard: '',
      isFavorite: false,
    },
  });

  // Atualiza a bandeira do cartão conforme o número digitado
  const numberCard = watch('numberCard');
  React.useEffect(() => {
    const flag = getCardFlag(numberCard || '');
    setValue('flagCard', flag);
  }, [numberCard, setValue]);

  const onSubmit: SubmitHandler<CardFormData> = async data => {
    try {
      await createCard(clientDocumentId, { card: data });
      toast.success('Novo cartão cadastrado com sucesso!');
      reset();
      if (onCardsRefresh) onCardsRefresh();
    } catch (error) {
      console.error('Erro ao cadastrar novo cartão:', error);
      toast.error('Erro ao cadastrar novo cartão.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex $direction="column" $gap="1rem">
        <Input
          id="holderName"
          label="Nome do Titular"
          placeholder="Nome do Titular"
          {...register('holderName')}
          error={errors.holderName?.message}
        />
        <Input
          id="numberCard"
          label="Número do Cartão"
          placeholder="1111.2222.3333.4444"
          maskFunction={maskCreditCard}
          {...register('numberCard')}
          error={errors.numberCard?.message}
        />
        <Input
          id="flagCard"
          label="Bandeira do Cartão"
          placeholder="Bandeira do Cartão"
          value={watch('flagCard') || ''}
          readOnly
        />
        <Input
          id="safeNumber"
          label="Código de Segurança"
          placeholder="123"
          maxLength={3}
          {...register('safeNumber')}
          error={errors.safeNumber?.message}
        />
        <Flex $direction="row" $align="center" $gap="0.5rem">
          <label>Favorito</label>
          <ToggleButton
            isActive={watch('isFavorite')}
            onToggle={() => setValue('isFavorite', !watch('isFavorite'))}
          />
        </Flex>
        <SubmitButton type="submit">Salvar novo cartão</SubmitButton>
      </Flex>
    </form>
  );
};

export default NewCardForm;
