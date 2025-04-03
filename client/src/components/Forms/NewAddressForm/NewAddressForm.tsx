import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '@/components/Inputs/Input/Input';
import { maskCEP } from '@/utils/masks';
import { SubmitButton } from './styled';
import { Flex } from '@/styles/global';
import { toast } from 'react-toastify';
import { createAddress } from '@/services/clientService';

interface AddressFormData {
  nameAddress: string;
  TypeAddress: string;
  typeLogradouro: string;
  nameLogradouro: string;
  number: string;
  neighborhood: string;
  cep: string;
  city: string;
  state: string;
  country: string;
  observation?: string;
}

interface NewAddressFormProps {
  clientDocumentId: string;
  onAddressRefresh?: () => void;
}

const addressSchema = yup.object().shape({
  nameAddress: yup.string().required('Nome do Endereço é obrigatório'),
  TypeAddress: yup.string().required('Tipo de Endereço é obrigatório'),
  typeLogradouro: yup.string().required('Tipo de Logradouro é obrigatório'),
  nameLogradouro: yup.string().required('Nome do Logradouro é obrigatório'),
  number: yup.string().required('Número é obrigatório'),
  neighborhood: yup.string().required('Bairro é obrigatório'),
  cep: yup.string().required('CEP é obrigatório'),
  city: yup.string().required('Cidade é obrigatória'),
  state: yup.string().required('Estado é obrigatório'),
  country: yup.string().required('País é obrigatório'),
  observation: yup.string(),
});

const NewAddressForm: React.FC<NewAddressFormProps> = ({
  clientDocumentId,
  onAddressRefresh,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      nameAddress: '',
      TypeAddress: '',
      typeLogradouro: '',
      nameLogradouro: '',
      number: '',
      neighborhood: '',
      cep: '',
      city: '',
      state: '',
      country: '',
      observation: '',
    },
  });

  const onSubmit: SubmitHandler<AddressFormData> = async data => {
    try {
      await createAddress(clientDocumentId, {
        address: {
          ...data,
          observation: data.observation || '', // Garante que seja uma string
        },
      });
      toast.success('Novo endereço cadastrado com sucesso!');
      reset();
      if (onAddressRefresh) onAddressRefresh();
    } catch (error) {
      console.error('Erro ao cadastrar novo endereço:', error);
      toast.error('Erro ao cadastrar novo endereço.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex $direction="column" $gap="1rem">
        <Input
          id="nameAddress"
          label="Nome do Endereço"
          placeholder="Exemplo de Endereço"
          {...register('nameAddress')}
          error={errors.nameAddress?.message}
        />
        <Input
          id="TypeAddress"
          label="Tipo de Endereço"
          placeholder="Cobrança ou Entrega"
          {...register('TypeAddress')}
          error={errors.TypeAddress?.message}
        />
        <Input
          id="typeLogradouro"
          label="Tipo de Logradouro"
          placeholder="Rua, Avenida, etc."
          {...register('typeLogradouro')}
          error={errors.typeLogradouro?.message}
        />
        <Input
          id="nameLogradouro"
          label="Nome do Logradouro"
          placeholder="Exemplo de Logradouro"
          {...register('nameLogradouro')}
          error={errors.nameLogradouro?.message}
        />
        <Input
          id="number"
          label="Número"
          placeholder="123"
          {...register('number')}
          error={errors.number?.message}
        />
        <Input
          id="neighborhood"
          label="Bairro"
          placeholder="Bairro Exemplo"
          {...register('neighborhood')}
          error={errors.neighborhood?.message}
        />
        <Input
          id="cep"
          label="CEP"
          placeholder="00000-000"
          maskFunction={maskCEP}
          {...register('cep')}
          error={errors.cep?.message}
        />
        <Input
          id="city"
          label="Cidade"
          placeholder="Cidade Exemplo"
          {...register('city')}
          error={errors.city?.message}
        />
        <Input
          id="state"
          label="Estado"
          placeholder="Estado Exemplo"
          {...register('state')}
          error={errors.state?.message}
        />
        <Input
          id="country"
          label="País"
          placeholder="Brasil"
          {...register('country')}
          error={errors.country?.message}
        />
        <Input
          id="observation"
          label="Observação"
          placeholder="Sem observação"
          {...register('observation')}
          error={errors.observation?.message}
        />
        <SubmitButton type="submit">Salvar novo endereço</SubmitButton>
      </Flex>
    </form>
  );
};

export default NewAddressForm;
