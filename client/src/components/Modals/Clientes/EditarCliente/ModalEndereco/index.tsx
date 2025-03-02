// components/Modals/Clientes/EditarCliente/ModalEndereco.tsx
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
import AddressForm from '@/components/Forms/AddressForm/AddressForm';

interface ModalEditarEnderecoProps {
  onClose: () => void;
  data: any[]; // Aqui data é a lista de endereços (data.addresses do cliente)
}

const ModalEndereco: React.FC<ModalEditarEnderecoProps> = ({ onClose, data }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue
  } = useForm<IRegisterForm>({
    defaultValues: {
      Address: data || [] // Preenche o campo "Address" com os endereços recebidos
    }
  });

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Editar Endereços
          <Closed onClick={onClose} />
        </ModalHeader>
        <ModalBody>
          <AddressForm
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

export default ModalEndereco;
