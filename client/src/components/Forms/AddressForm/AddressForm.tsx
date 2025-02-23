import React from 'react';
import {
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
  Controller,
  useWatch,
  UseFormSetValue
} from 'react-hook-form';
import { IRegisterForm } from '@/validations/RegisterSchema';
import Input from '@/components/Inputs/Input/Input';
import CustomSelect from '@/components/Select';
import { Flex } from '@/styles/global';
import { maskCEP } from '@/utils/masks';
import { ErrorMessage, SubmitButton } from './styled';

interface AddressFormProps {
  control: Control<IRegisterForm>;
  register: UseFormRegister<IRegisterForm>;
  errors: FieldErrors<IRegisterForm>;
  setValue: UseFormSetValue<IRegisterForm>;

  /**
   * Nova prop para sabermos se o formulário está sendo
   * exibido dentro do ModalEditarEndereco
   */
  isFromModal?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  control,
  register,
  errors,
  setValue,
  isFromModal = false // default false
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Address'
  });

  // Observa todo o array de endereços
  const addresses = useWatch({ control, name: 'Address' }) || [];

  const typeAddressOptions = [
    { value: 'Cobrança', label: 'Cobrança' },
    { value: 'Entrega', label: 'Entrega' }
  ];

  const logradouroOptions = [
    { value: 'Rua', label: 'Rua' },
    { value: 'Avenida', label: 'Avenida' },
    { value: 'Distrito', label: 'Distrito' },
    { value: 'Rodovias', label: 'Rodovias' },
    { value: 'Condomínio', label: 'Condomínio' }
  ];

  // Adicionar novo endereço
  const handleAddAddress = () => {
    append({
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
      observation: ''
    });
  };

  // Função que verifica se podemos remover um endereço específico
  const canRemoveAddress = (index: number) => {
    // 1) Se já temos exatamente 2 endereços no total,
    //    não podemos remover porque precisamos de pelo menos 1 Cobrança e 1 Entrega
    if (fields.length <= 2) {
      return false;
    }

    // Pega o tipo do endereço atual (Cobrança ou Entrega)
    const addressType = addresses[index]?.TypeAddress;
    if (!addressType) return true; // Se não tiver tipo definido, deixar remover

    // 2) Verifica quantos endereços existem desse tipo
    const sameTypeAddresses = addresses.filter(addr => addr.TypeAddress === addressType);
    // Se for o único endereço deste tipo, não podemos remover
    if (sameTypeAddresses.length <= 1) {
      return false;
    }

    // Se nenhuma das condições acima se aplicar, podemos remover
    return true;
  };

  return (
    <Flex $direction="column">
      <h3>Endereços</h3>
      {fields.map((field, index) => (
        <Flex
          $direction="column"
          $gap="1rem"
          key={field.id}
          style={{ marginBottom: '1rem', border: '1px solid #eee', padding: '1rem' }}
        >
          <h4>Endereço {index + 1}</h4>

          <Input
            id={`Address[${index}].nameAddress`}
            label="Nome do Endereço"
            placeholder="Exemplo de Endereço"
            {...register(`Address.${index}.nameAddress` as const)}
            error={errors?.Address && errors.Address[index]?.nameAddress?.message}
          />

          {/* Select para Tipo de Endereço */}
          <Controller
            control={control}
            name={`Address.${index}.TypeAddress`}
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                id={`Address[${index}].TypeAddress`}
                name={`Address.${index}.TypeAddress`}
                label="Tipo de Endereço"
                options={typeAddressOptions}
                value={value}
                onChange={(option) => {
                  onChange(option?.value);
                }}
              />
            )}
          />
          {errors?.Address && errors.Address[index]?.TypeAddress && (
            <ErrorMessage>{errors.Address[index]?.TypeAddress?.message}</ErrorMessage>
          )}

          {/* Select para Tipo de Logradouro */}
          <Controller
            control={control}
            name={`Address.${index}.typeLogradouro`}
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                id={`Address.${index}.typeLogradouro`}
                name={`Address.${index}.typeLogradouro`}
                label="Tipo de Logradouro"
                options={logradouroOptions}
                value={value}
                onChange={(option) => onChange(option?.value)}
              />
            )}
          />
          {errors?.Address && errors.Address[index]?.typeLogradouro && (
            <ErrorMessage>{errors.Address[index]?.typeLogradouro?.message}</ErrorMessage>
          )}

          <Input
            id={`Address[${index}].nameLogradouro`}
            label="Nome do Logradouro"
            placeholder="Exemplo de Logradouro"
            {...register(`Address.${index}.nameLogradouro` as const)}
            error={errors?.Address && errors.Address[index]?.nameLogradouro?.message}
          />

          <Input
            id={`Address[${index}].number`}
            label="Número"
            placeholder="123"
            {...register(`Address.${index}.number` as const)}
            error={errors?.Address && errors.Address[index]?.number?.message}
          />

          <Input
            id={`Address[${index}].neighborhood`}
            label="Bairro"
            placeholder="Bairro Exemplo"
            {...register(`Address.${index}.neighborhood` as const)}
            error={errors?.Address && errors.Address[index]?.neighborhood?.message}
          />

          <Input
            id={`Address[${index}].cep`}
            label="CEP"
            placeholder="00000-000"
            maskFunction={maskCEP}
            {...register(`Address.${index}.cep` as const)}
            error={errors?.Address && errors.Address[index]?.cep?.message}
          />

          <Input
            id={`Address[${index}].city`}
            label="Cidade"
            placeholder="Cidade Exemplo"
            {...register(`Address.${index}.city` as const)}
            error={errors?.Address && errors.Address[index]?.city?.message}
          />

          <Input
            id={`Address[${index}].state`}
            label="Estado"
            placeholder="Estado Exemplo"
            {...register(`Address.${index}.state` as const)}
            error={errors?.Address && errors.Address[index]?.state?.message}
          />

          <Input
            id={`Address[${index}].country`}
            label="País"
            placeholder="Brasil"
            {...register(`Address.${index}.country` as const)}
            error={errors?.Address && errors.Address[index]?.country?.message}
          />

          <Input
            id={`Address[${index}].observation`}
            label="Observação"
            placeholder="Sem observação"
            {...register(`Address.${index}.observation` as const)}
            error={errors?.Address && errors.Address[index]?.observation?.message}
          />

          {/* Botão para remover o endereço, se permitido */}
          {canRemoveAddress(index) && (
            <SubmitButton type="button" onClick={() => remove(index)}>
              Remover Endereço
            </SubmitButton>
          )}
        </Flex>
      ))}

      <SubmitButton type="button" onClick={handleAddAddress}>
        Adicionar Endereço
      </SubmitButton>

      {/* Se estiver no modal, mostra o botão "Salvar mudança" (type="submit") */}
      {isFromModal && (
        <SubmitButton type="submit" style={{ marginTop: '1rem' }}>
          Salvar mudança
        </SubmitButton>
      )}
    </Flex>
  );
};

export default AddressForm;
