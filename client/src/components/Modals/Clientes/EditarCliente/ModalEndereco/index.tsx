// ModalEditarEndereco.tsx
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
  data: any; // Recebe o user, onde data.addresses = lista de endereços
}

const ModalEditarEndereco: React.FC<ModalEditarEnderecoProps> = ({ onClose, data }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue
  } = useForm<IRegisterForm>({
    // Preenchemos o Address com data.addresses
    defaultValues: {
      Address: data?.addresses || []
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

export default ModalEditarEndereco;
