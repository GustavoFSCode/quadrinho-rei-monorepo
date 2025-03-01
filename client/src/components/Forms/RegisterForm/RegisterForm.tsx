// components/Forms/RegisterForm/RegisterForm.tsx
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import handleError from '@/utils/handleToast';
import Input from '@/components/Inputs/Input/Input';
import { Flex } from '@/styles/global';
import { IRegisterForm, RegisterSchema } from '@/validations/RegisterSchema';
import { Container, ErrorMessage, FormContainer, SubmitButton } from './styles';
import AddressForm from '../AddressForm/AddressForm';
import CardForm from '../CardForm/CardForm';
import ModalSuccess from '@/components/Modals/ModalSuccess/ModalSuccess';
import { useRouter } from 'next/navigation';
import CustomSelect from '@/components/Select';
import { maskCPFOrCNPJ, maskPhone } from '@/utils/masks';
import { getCardFlag } from '@/utils/masks';
import { createClient } from '@/services/clientService';

interface RegisterFormProps {
  onClose: () => void;
  onClientCreated: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onClose, onClientCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSucessModal, setShowSucessModal] = useState(false);
  const router = useRouter();

  const onError = (errors: FieldErrors<IRegisterForm>) => {
    console.log('Erros de validação:', errors);
    if (errors.Address?.root?.message === "É necessário pelo menos um endereço de Cobrança e um de Entrega") {
      handleError(errors.Address.root);
    }
  };

  const {
    setValue,
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<IRegisterForm>({
    resolver: yupResolver(RegisterSchema),
    defaultValues: {
      Address: [
        { TypeAddress: 'Cobrança' },
        { TypeAddress: 'Entrega' }
      ],
      Cards: [
        { isFavorite: true }
      ]
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

  const onSubmit: SubmitHandler<IRegisterForm> = async (data) => {
    try {
      setIsSubmitting(true);

      data.Cards = (data.Cards || []).map(card => ({
        ...card,
        flagCard: getCardFlag(card.numberCard || '')
      }));

      // Converte a data para string "YYYY-MM-DD"
      const formattedBirthDate =
        data.birthDate instanceof Date
          ? data.birthDate.toISOString().split('T')[0]
          : data.birthDate;

      // Formata os endereços para garantir que observation seja uma string
      const formattedAddresses = (data.Address ?? []).map(address => ({
        ...address,
        observation: address.observation || ""
      }));

      const payload = {
        email: data.email,
        password: data.password,
        name: data.name,
        birthDate: formattedBirthDate,
        gender: data.gender,
        cpf: data.cpf,
        phone: data.phone,
        typePhone: data.typePhone,
        ranking: data.ranking,
        Address: formattedAddresses,
        Card: data.Cards ?? []
      };

      await createClient(payload);

      // Chama o callback para atualizar a lista de clientes
      onClientCreated();

      // Exibe o modal de sucesso e fecha após confirmação
      setShowSucessModal(true);
    } catch (error) {
      console.error("Erro no onSubmit:", error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      {showSucessModal && (
        <ModalSuccess
          maxwidth="20rem"
          maxheight="20rem"
          text="Sucesso!"
          subText="Cadastro efetuado com sucesso"
          solidButton={{
            text: 'Voltar',
            action: () => onClose()
          }}
        />
      )}

      <FormContainer onSubmit={handleSubmit(onSubmit, onError)}>
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
            id="password"
            label="Senha"
            type="password"
            placeholder="Insira a senha"
            {...register('password')}
            error={errors?.password?.message}
          />
          <Input
            id="confirm_password"
            label="Confirmar Senha"
            type="password"
            placeholder="Confirme a senha"
            {...register('confirm_password')}
            error={errors?.confirm_password?.message}
          />
          <Input
            id="ranking"
            type="number"
            label="Ranking"
            placeholder="Digite o ranking"
            {...register('ranking', { valueAsNumber: true })}
            error={errors?.ranking?.message}
          />
        </Flex>

        <AddressForm control={control} register={register} errors={errors} setValue={setValue} />
        <CardForm control={control} register={register} errors={errors} setValue={setValue} />

        <Flex $direction="row" $gap="1.25rem" $justify="space-between">
          <SubmitButton type="submit" disabled={isSubmitting}>
            Cadastrar
          </SubmitButton>
        </Flex>
      </FormContainer>
    </Container>
  );
};

export default RegisterForm;
