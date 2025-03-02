// components/Modals/Clientes/EditarCliente/ModalCartao.tsx
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
  data: any[]; // Aqui data é a lista de cartões (data.cards do cliente)
}

const ModalCartao: React.FC<ModalEditarCartaoProps> = ({ onClose, data }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue
  } = useForm<IRegisterForm>({
    defaultValues: {
      Cards: data || [] // Preenche o campo "Cards" com os cartões recebidos
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

export default ModalCartao;
