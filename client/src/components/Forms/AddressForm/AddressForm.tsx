// components/Forms/AddressForm/AddressForm.tsx
import React from 'react';
import {
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
  Controller
} from 'react-hook-form';
import { IRegisterForm } from '@/validations/RegisterSchema';
import Input from '@/components/Inputs/Input/Input';
import CustomSelect from '@/components/Select';
import { Flex } from '@/styles/global';
import { maskCEP } from '@/utils/masks';

interface AddressFormProps {
  control: Control<IRegisterForm>;
  register: UseFormRegister<IRegisterForm>;
  errors: FieldErrors<IRegisterForm>;
}

const AddressForm: React.FC<AddressFormProps> = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Address'
  });

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

  return (
    <Flex $direction="column" $gap="1rem">
      <h3>Endereços</h3>
      {fields.map((field, index) => (
        <div
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
                onChange={(option) => onChange(option?.value)}
              />
            )}
          />
          {errors?.Address && errors.Address[index]?.TypeAddress && (
            <p>{errors.Address[index]?.TypeAddress?.message}</p>
          )}
          {/* Select para Tipo de Logradouro */}
          <Controller
            control={control}
            name={`Address.${index}.typeLogradouro`}
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                id={`Address[${index}].typeLogradouro`}
                name={`Address.${index}.typeLogradouro`}
                label="Tipo de Logradouro"
                options={logradouroOptions}
                value={value}
                onChange={(option) => onChange(option?.value)}
              />
            )}
          />
          {errors?.Address && errors.Address[index]?.typeLogradouro && (
            <p>{errors.Address[index]?.typeLogradouro?.message}</p>
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
          {/* Renderiza o botão de remover apenas se houver mais de 2 endereços */}
          {fields.length > 2 && (
            <button type="button" onClick={() => remove(index)}>
              Remover Endereço
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
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
          })
        }
      >
        Adicionar Endereço
      </button>
    </Flex>
  );
};

export default AddressForm;
