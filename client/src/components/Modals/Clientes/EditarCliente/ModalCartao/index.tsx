// ModalEditarCartao.tsx

import React from 'react';
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
  data: any; // Recebe o usuário completo ou apenas o array de cartões
}

const ModalEditarCartao: React.FC<ModalEditarCartaoProps> = ({ onClose, data }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue
  } = useForm<IRegisterForm>({
    defaultValues: {
      // Se 'data.cards' vier do seu fakeUser
      Cards: data?.cards || []
    }
  });

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
          />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalEditarCartao;
