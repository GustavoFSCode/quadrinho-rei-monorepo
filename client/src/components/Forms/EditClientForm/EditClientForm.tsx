// components/Forms/EditClientForm/EditClientForm.tsx
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import handleError from '@/utils/handleToast';
import Input from '@/components/Inputs/Input/Input';
import { Flex } from '@/styles/global';
import { IEditClientForm, EditClientSchema } from '@/validations/EditClientSchema';
import { Container, ErrorMessage, FormContainer, ModalButton, SubmitButton } from './styled';
import ModalSuccess from '@/components/Modals/ModalSuccess/ModalSuccess';
import CustomSelect from '@/components/Select';
import { maskCPFOrCNPJ, maskPhone, onlyDigits } from '@/utils/masks';
import { getCardFlag } from '@/utils/masks';
import ButtonOutlinePrimary from '@/components/Buttons/ButtonOutlinePrimary';
import ModalChangePassword from '@/components/Modals/ModalChangePassword/ModalChangePassword';
import ModalEndereco from '@/components/Modals/Clientes/EditarCliente/ModalEndereco';
import ModalCartao from '@/components/Modals/Clientes/EditarCliente/ModalCartao';

interface EditClientFormProps {
  onClose: () => void;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSucessModal, setShowSucessModal] = useState(false);
  const [isModalPasswordOpen, setIsModalPasswordOpen] = useState(false);
  const [isModalCartaoOpen, setIsModalCartaoOpen] = useState(false);
  const [isModalEnderecoOpen, setIsModalEnderecoOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<IEditClientForm>({
    resolver: yupResolver(EditClientSchema),
  });

  // Opções para os selects
  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' }
  ];
  const phoneOptions = [
    { value: 'Celular', label: 'Celular' },
    { value: 'Fixo', label: 'Fixo' }
  ];

  const onSubmit: SubmitHandler<IEditClientForm> = async (data) => {
    try {
      setIsSubmitting(true);
      console.log("Dados do formulário:", data);

      setShowSucessModal(true);
    } catch (error) {
      console.error("Erro no onSubmit:", error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  function onSuccessModalPassword(form: { password: string; confirm_password: string; }): void {
    throw new Error('Function not implemented.');
  }

  const handleCloseEnderecoModal = () => {
    setIsModalEnderecoOpen(false);
}

const handleCloseCartaoModal = () => {
  setIsModalCartaoOpen(false);
}

  return (
    <>
      <Container>
        {showSucessModal && (
          <ModalSuccess
            maxwidth="20rem"
            maxheight="20rem"
            text="Sucesso!"
            subText="Edição efetuada com sucesso"
            solidButton={{
              text: 'Voltar',
              action: () => onClose()
            }}
          />
        )}

        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <Flex $direction="column" $gap="1.15rem">
            <h3>Dados do Cliente</h3>

            <Input
              id="name"
              autoComplete="name"
              label="Nome completo"
              placeholder="Insira seu nome completo"
              {...register('name')}
              error={errors?.name?.message}
            />

            <Input
              id="birthDate"
              type="date"
              label="Data de Nascimento"
              placeholder="2000-01-01"
              {...register('birthDate')}
              error={errors?.birthDate?.message}
            />

            {/* Campo Select para Gênero */}
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <CustomSelect
                  id="gender"
                  name="gender"
                  label="Gênero"
                  options={genderOptions}
                  value={value}
                  onChange={(option) => onChange(option?.value)}
                />
              )}
            />
            {errors?.gender && <ErrorMessage>{errors.gender.message}</ErrorMessage>}

            <Input
              id="cpf"
              label="CPF"
              placeholder="123.456.789-10"
              maskFunction={maskCPFOrCNPJ}
              maxLength={14}
              {...register('cpf')}
              error={errors?.cpf?.message}
            />

            <Input
              id="phone"
              autoComplete="tel-national"
              label="Telefone"
              maskFunction={maskPhone}
              minLength={14}
              maxLength={15}
              placeholder="(00) 00000-0000"
              {...register('phone')}
              error={errors?.phone?.message}
            />

            {/* Campo Select para Tipo de Telefone */}
            <Controller
              control={control}
              name="typePhone"
              render={({ field: { onChange, value } }) => (
                <CustomSelect
                  id="typePhone"
                  name="typePhone"
                  label="Tipo de Telefone"
                  options={phoneOptions}
                  value={value}
                  onChange={(option) => onChange(option?.value)}
                />
              )}
            />
            {errors?.typePhone && <ErrorMessage>{errors.typePhone.message}</ErrorMessage>}

            <Input
              id="email"
              autoComplete="email"
              type="email"
              label="E-mail"
              placeholder="Insira o e-mail"
              {...register('email')}
              error={errors?.email?.message}
            />

            <Input
              id="ranking"
              type="number"
              label="Ranking"
              placeholder="Digite o ranking"
              maskFunction={onlyDigits}
              {...register('ranking')}
              error={errors?.ranking?.message}
            />
          </Flex>
          <Flex $direction="row" $gap="1.25rem" $justify="space-between">
            <SubmitButton type="submit" disabled={isSubmitting}>
              Editar
            </SubmitButton>
          </Flex>
        </FormContainer>
        <Flex $direction='column' $gap='1.25rem'>
          <Flex $direction='row' $justify='center' $gap='2rem' $align='center'>
            {/* Em vez de chamar onClose, chamamos setIsModalEnderecoOpen(true) */}
            <ModalButton type='button' onClick={() => setIsModalEnderecoOpen(true)}>
              Gerenciar endereços
            </ModalButton>

            <ModalButton type='button' onClick={() => setIsModalCartaoOpen(true)}>
              Gerenciar cartões
            </ModalButton>
          </Flex>

          <Flex $direction='row' $gap='1rem' $justify='center' $align='center'>
            <ModalButton type='button' onClick={() => setIsModalPasswordOpen(true)}>
              Alterar senha
            </ModalButton>
          </Flex>
        </Flex>
      </Container>
      {isModalPasswordOpen && <ModalChangePassword title='Alterar Senha' setShowModal={setIsModalPasswordOpen} onSuccess={onSuccessModalPassword} />}
      {isModalEnderecoOpen && <ModalEndereco onClose={handleCloseEnderecoModal} data="Endereços do cliente" />}
      {isModalCartaoOpen && <ModalCartao onClose={handleCloseCartaoModal} data="Cartões do cliente" />}
    </>
  );
};

export default EditClientForm;
