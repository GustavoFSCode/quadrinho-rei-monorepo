import React, { useState } from 'react';
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

// IMPORTS DOS MODAIS
import ModalSuccess from '@/components/Modals/ModalSuccess/ModalSuccess';
import ModalDanger from '@/components/Modals/ModalDanger/ModalDanger';

// IMPORTAÇÃO DO TOAST
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { editAddress, deleteAddress, createAddress } from '@/services/clientService';
import * as yup from 'yup';

// Schema para validação dos campos de endereço (baseado no RegisterSchema)
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
  observation: yup.string() // campo opcional
});

interface AddressFormProps {
  control: Control<IRegisterForm>;
  register: UseFormRegister<IRegisterForm>;
  errors: FieldErrors<IRegisterForm>;
  setValue: UseFormSetValue<IRegisterForm>;
  isFromModal?: boolean;
  onAddressRefresh?: () => void;
  clientDocumentId?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  control,
  register,
  errors,
  setValue,
  isFromModal = false,
  onAddressRefresh,
  clientDocumentId
}) => {
  // Estados para controlar os modais de sucesso e para confirmação de remoção
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados usados apenas para confirmação de remoção
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [addressIndexToRemove, setAddressIndexToRemove] = useState<number | null>(null);

  // RHF
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Address'
  });
  const addresses = useWatch({ control, name: 'Address' }) || [];

  // Opções de selects
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

  // =======================
  // Ações de CRUD integradas com a API
  // =======================

  // Adiciona um novo endereço na lista
  const handleAddAddress = () => {
    append({
      addressId: null,
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

  // Salva alterações (PUT) no endereço existente após validação com yup
  const handleSaveChange = async (index: number) => {
    const addr = addresses[index];
    try {
      await addressSchema.validate(addr, { abortEarly: false });
      if (addr.documentId) {
        await editAddress(addr.documentId, {
          address: {
            nameAddress: addr.nameAddress,
            TypeAddress: addr.TypeAddress,
            typeLogradouro: addr.typeLogradouro,
            nameLogradouro: addr.nameLogradouro,
            number: addr.number,
            neighborhood: addr.neighborhood,
            cep: addr.cep,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            observation: addr.observation || ''
          }
        });
        setSuccessMessage('Endereço atualizado com sucesso!');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      let message = 'Erro ao atualizar endereço.';
      if (error instanceof yup.ValidationError) {
        message = error.errors.join(', ');
      }
      toast.error(message);
    }
  };

  // Salva novo endereço (POST) após validação com yup
  const handleSaveNew = async (index: number) => {
    const addr = addresses[index];
    try {
      await addressSchema.validate(addr, { abortEarly: false });
      if (!clientDocumentId) {
        toast.error('Client document ID não informado.');
        return;
      }
      await createAddress(clientDocumentId, {
        address: {
          nameAddress: addr.nameAddress,
          TypeAddress: addr.TypeAddress,
          typeLogradouro: addr.typeLogradouro,
          nameLogradouro: addr.nameLogradouro,
          number: addr.number,
          neighborhood: addr.neighborhood,
          cep: addr.cep,
          city: addr.city,
          state: addr.state,
          country: addr.country,
          observation: addr.observation || ''
        }
      });
      setSuccessMessage('Novo endereço cadastrado com sucesso!');
      setShowSuccessModal(true);
      if (onAddressRefresh) {
        onAddressRefresh();
      }
    } catch (error) {
      console.error('Erro ao cadastrar novo endereço:', error);
      let message = 'Erro ao cadastrar novo endereço.';
      if (error instanceof yup.ValidationError) {
        message = error.errors.join(', ');
      }
      toast.error(message);
    }
  };

  // Handler para remoção de endereço (abre modal de confirmação)
  const handleClickRemove = (index: number) => {
    setAddressIndexToRemove(index);
    // Para confirmação de remoção, mantém o ModalDanger
    setShowDangerModal(true);
  };

  // Confirma a remoção; se isFromModal for verdadeiro e o endereço for existente, chama o DELETE da API
  const confirmRemoveAddress = async () => {
    if (addressIndexToRemove != null) {
      const addr = addresses[addressIndexToRemove];
      if (isFromModal && (addr.addressId || addr.id) && addr.documentId) {
        try {
          await deleteAddress(addr.documentId);
        } catch (error) {
          console.error('Erro ao deletar endereço:', error);
          toast.error('Erro ao deletar endereço.');
        }
      }
      remove(addressIndexToRemove);
    }
    setShowDangerModal(false);
    setAddressIndexToRemove(null);
  };

  // Lógica para não remover endereços que quebrariam a regra (ex: deve ter 1 Cobrança e 1 Entrega)
  const canRemoveAddress = (index: number) => {
    if (fields.length <= 2) return false;
    const addressType = addresses[index]?.TypeAddress;
    if (!addressType) return true;
    const sameTypeAddresses = addresses.filter(addr => addr.TypeAddress === addressType);
    return sameTypeAddresses.length > 1;
  };

  // =====================
  // RENDER
  // =====================
  return (
    <Flex $direction="column">
      <ToastContainer />
      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <ModalSuccess
          maxwidth="20rem"
          maxheight="20rem"
          text={successMessage}
          subText=""
          solidButton={{
            text: 'Ok',
            action: () => setShowSuccessModal(false)
          }}
        />
      )}

      {/* Modal de Confirmação para remoção */}
      {showDangerModal && (
        <ModalDanger
          maxwidth="20rem"
          maxheight="20rem"
          text="Deseja realmente remover este endereço?"
          outlineButton={{
            text: 'Não',
            action: () => setShowDangerModal(false)
          }}
          solidButton={{
            text: 'Sim',
            action: () => confirmRemoveAddress()
          }}
        />
      )}

      <h3>Endereços</h3>
      {fields.map((field, index) => {
        const currentAddr = addresses[index];
        const isExistingAddress = currentAddr?.addressId != null || currentAddr?.id != null;
        return (
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
                  id={`Address.${index}.TypeAddress`}
                  name={`Address.${index}.TypeAddress`}
                  label="Tipo de Endereço"
                  options={typeAddressOptions}
                  value={value}
                  onChange={(option) => onChange(option?.value)}
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

            {/* Botões para salvar */}
            {isFromModal && (
              isExistingAddress ? (
                <SubmitButton
                  type="button"
                  onClick={() => handleSaveChange(index)}
                  style={{ marginTop: '1rem' }}
                >
                  Salvar mudança
                </SubmitButton>
              ) : (
                <SubmitButton
                  type="button"
                  onClick={() => handleSaveNew(index)}
                  style={{ marginTop: '1rem' }}
                >
                  Salvar novo endereço
                </SubmitButton>
              )
            )}

            {/* Botão remover */}
            {canRemoveAddress(index) && (
              <SubmitButton
                type="button"
                onClick={() => handleClickRemove(index)}
                style={{ marginTop: '1rem', backgroundColor: '#d9534f' }}
              >
                Remover Endereço
              </SubmitButton>
            )}
          </Flex>
        );
      })}

      {/* Botão para adicionar novo endereço */}
      <SubmitButton type="button" onClick={handleAddAddress}>
        Adicionar Endereço
      </SubmitButton>
    </Flex>
  );
};

export default AddressForm;
