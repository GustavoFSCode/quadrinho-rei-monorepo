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
  data: any; // aqui você recebe os endereços do cliente, por exemplo
}

const ModalEditarEndereco: React.FC<ModalEditarEnderecoProps> = ({ onClose, data }) => {
  // Crie seu form aqui (ou reaproveite caso já exista um em outro lugar).
  // data.enderecos seria onde ficam os endereços do usuário vindos da API, por exemplo.
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<IRegisterForm>({
    defaultValues: {
      Address: data?.enderecos || []
    }
  });

  // Quando o usuário clicar em "Salvar mudança"
  const onSubmit = (formData: IRegisterForm) => {
    console.log('Endereços atualizados:', formData.Address);
    // Faça aqui a lógica de envio para API ou atualização no seu estado global
    onClose(); // e então fecha o modal
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Editar Endereços
          <Closed onClick={onClose} />
        </ModalHeader>
        <ModalBody>
          {/*
            Envolvemos o AddressForm dentro de um <form>, para que o botão "Salvar mudança"
            (lá dentro) possa ser do tipo="submit" e dispare o onSubmit.
          */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <AddressForm
              control={control}
              register={register}
              errors={errors}
              setValue={setValue}
              // Essa prop extra indica que estamos usando o AddressForm no Modal
              isFromModal
            />
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalEditarEndereco;
