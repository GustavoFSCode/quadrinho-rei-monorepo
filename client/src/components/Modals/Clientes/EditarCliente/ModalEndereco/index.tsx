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
import AddressForm from '@/components/Forms/AddressForm/AddressForm';

interface ModalEditarEnderecoProps {
  onClose: () => void;
  data: any[]; // Aqui data é a lista de endereços (data.addresses do cliente)
  onAddressRefresh: () => Promise<void>;
  clientDocumentId: string;
}

const ModalEndereco: React.FC<ModalEditarEnderecoProps> = ({ onClose, data, onAddressRefresh, clientDocumentId }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    reset
  } = useForm<IRegisterForm>({
    defaultValues: {
      Address: data || [] // Preenche o campo "Address" com os endereços recebidos
    }
  });

  // Atualiza o formulário sempre que a prop "data" mudar
  useEffect(() => {
    reset({ Address: data || [] });
  }, [data, reset]);

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
            onAddressRefresh={onAddressRefresh}
            clientDocumentId={clientDocumentId}
          />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalEndereco;
