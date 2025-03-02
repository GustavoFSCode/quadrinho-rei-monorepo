// components/Modals/ModalChangePassword/ModalChangePassword.tsx
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Flex } from '@/styles/global';
import ButtonOutlinePrimary from '@/components/Buttons/ButtonOutlinePrimary';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import Input from '@/components/Inputs/Input/Input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import handleError from '@/utils/handleToast';
import { ChangeySchema, IChangeForm } from '@/validations/LoginSchema';
import { Box, BoxOverflow, Container } from '../styles';
import { Form, Title } from './styles';
import ModalSuccess from '../ModalSuccess/ModalSuccess';
import ModalDanger from '../ModalDanger/ModalDanger';
import { changePassword } from '@/services/clientService';

interface Props {
  title: string;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onSuccess: (form: IChangeForm) => void;
  userDocumentId: string;
}

const ModalChangePassword: React.FC<Props> = ({ title, setShowModal, onSuccess, userDocumentId }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IChangeForm>({
    mode: 'onChange',
    resolver: yupResolver(ChangeySchema),
  });

  async function onSubmit(form: IChangeForm) {
    try {
      // Chama a função para alterar a senha passando o documentId e a nova senha
      await changePassword(userDocumentId, form.password);
      setShowSuccessModal(true);
      onSuccess(form);
    } catch (error) {
      handleError(error);
    }
  }

  return (
    <Container>
      {showSuccessModal && (
        <ModalSuccess
          maxwidth="18.75rem"
          maxheight="18.75rem"
          text="Senha alterada com sucesso!"
          solidButton={{
            text: 'Voltar',
            action: () => setShowModal(false),
          }}
        />
      )}
      {showDiscardModal && (
        <ModalDanger
          maxwidth="18.75rem"
          maxheight="18.75rem"
          text="Deseja descartar alterações?"
          outlineButton={{
            text: 'Não',
            action: () => {
              setShowDiscardModal(false);
            },
          }}
          solidButton={{
            text: 'Sim',
            action: () => {
              setShowModal(false);
            },
          }}
        />
      )}
      <Box $maxwidth="490px" $maxheight="fit-content">
        <BoxOverflow>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Flex $direction="column" $gap="1.875rem">
              <Title>{title}</Title>
              <Flex $direction="column" $gap="0.9375rem">
                <Input
                  id="new_password"
                  type="password"
                  label="Nova senha"
                  placeholder="Digite sua senha..."
                  {...register('password')}
                  error={errors?.password?.message}
                />
                <Input
                  id="confirm_password"
                  type="password"
                  label="Confirme a nova senha"
                  placeholder="Confirme sua senha..."
                  {...register('confirm_password')}
                  error={errors?.confirm_password?.message}
                />
              </Flex>
              <Flex $wrap="wrap" $justify="center" $gap="20px">
                <ButtonOutlinePrimary
                  type="button"
                  maxwidth="6.25rem"
                  onClick={() => setShowDiscardModal(true)}
                >
                  Cancelar
                </ButtonOutlinePrimary>
                <ButtonPrimary type="submit" maxwidth="6.25rem">
                  Alterar
                </ButtonPrimary>
              </Flex>
            </Flex>
          </Form>
        </BoxOverflow>
      </Box>
    </Container>
  );
};

export default ModalChangePassword;
