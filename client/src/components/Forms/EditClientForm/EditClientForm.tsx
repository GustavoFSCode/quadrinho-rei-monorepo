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
import ModalChangePassword from '@/components/Modals/ModalChangePassword/ModalChangePassword';
import ModalEndereco from '@/components/Modals/Clientes/EditarCliente/ModalEndereco';
import ModalCartao from '@/components/Modals/Clientes/EditarCliente/ModalCartao';
import { Client, editClient } from '@/services/clientService';

interface EditClientFormProps {
  onClose: () => void;
  data: Client;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ onClose, data }) => {
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
    defaultValues: {
      name: data.name || '',
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      gender: data.gender || '',
      cpf: data.cpf || '',
      phone: data.phone || '',
      typePhone: data.typePhone || '',
      email: data.user.email || '',
      ranking: data.ranking || 0
    }
  });

  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' }
  ];
  const phoneOptions = [
    { value: 'Celular', label: 'Celular' },
    { value: 'Fixo', label: 'Fixo' }
  ];

  const onSubmit: SubmitHandler<IEditClientForm> = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log("Dados do formulário de EDIÇÃO DE CLIENTE:", formData);
      // Converte a data para o formato "YYYY-MM-DD"
      const formattedBirthDate =
        formData.birthDate instanceof Date
          ? formData.birthDate.toISOString().split('T')[0]
          : formData.birthDate;

      // Monta o payload utilizando o email para preencher username e email
      const payload = {
        clientEdit: {
          client: {
            name: formData.name,
            birthDate: formattedBirthDate,
            gender: formData.gender,
            cpf: formData.cpf,
            phone: formData.phone,
            typePhone: formData.typePhone,
            ranking: formData.ranking
          },
          user: {
            username: formData.email,
            email: formData.email
          }
        }
      };

      await editClient(data.documentId, payload);

      setShowSucessModal(true);
    } catch (error) {
      console.error("Erro no onSubmit:", error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  function onSuccessModalPassword(form: { password: string; confirm_password: string; }): void {
    console.log("Nova senha:", form.password);
  }

  const handleCloseEnderecoModal = () => {
    setIsModalEnderecoOpen(false);
  };

  const handleCloseCartaoModal = () => {
    setIsModalCartaoOpen(false);
  };

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
            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, value } }) => (
                <Input
                  id="birthDate"
                  type="date"
                  label="Data de Nascimento"
                  placeholder="2000-01-01"
                  value={value ? (value instanceof Date ? value.toISOString().split('T')[0] : value) : ''}
                  onChange={(e) => {
                    onChange(new Date(e.target.value));
                  }}
                  error={errors?.birthDate?.message}
                />
              )}
            />
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

      {isModalPasswordOpen && (
        <ModalChangePassword
          title='Alterar Senha'
          userDocumentId={data.user.documentId}
          setShowModal={setIsModalPasswordOpen}
          onSuccess={onSuccessModalPassword}
        />
      )}

      {isModalEnderecoOpen && (
        <ModalEndereco
          onClose={handleCloseEnderecoModal}
          data={data.addresses || []}
        />
      )}

      {isModalCartaoOpen && (
        <ModalCartao
          onClose={handleCloseCartaoModal}
          data={data.cards || []}
        />
      )}
    </>
  );
};

export default EditClientForm;
