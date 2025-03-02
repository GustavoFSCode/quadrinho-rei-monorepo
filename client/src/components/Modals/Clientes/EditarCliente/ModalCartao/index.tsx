import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IRegisterForm } from '@/validations/RegisterSchema';

import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody
} from './styled';

import Closed from "@/components/icons/Closed";
import CardForm from '@/components/Forms/CardForm/CardForm';

interface ModalEditarCartaoProps {
  onClose: () => void;
  data: any[]; // data é a lista de cartões (clientData.cards)
  onCardsRefresh: () => Promise<void>;
}

const ModalCartao: React.FC<ModalEditarCartaoProps> = ({ onClose, data, onCardsRefresh }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    reset
  } = useForm<IRegisterForm>({
    defaultValues: {
      Cards: data || []
    }
  });

  // Atualiza o formulário sempre que a prop "data" mudar
  useEffect(() => {
    reset({ Cards: data || [] });
  }, [data, reset]);

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Editar Cartões
          <Closed onClick={onClose} />
        </ModalHeader>
        <ModalBody>
          <CardForm
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            isFromModal
            onCardsRefresh={onCardsRefresh}
          />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalCartao;
