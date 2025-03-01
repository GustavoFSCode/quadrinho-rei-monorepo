// components/Modals/Clientes/ExcluirCliente/ModalDescartation.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModalOverlay, ModalBox, ModalContent, ModalButtons, ModalText } from './styled';
import Button from '@/components/Button';
import Image from 'next/image';
import ExcludeIcon from '../../../../icons/ExcludeBox.png';
import ModalConfirmation from '../Confirmation';
import { deleteUser } from '@/services/clientService';

interface ModalDescartationProps {
  onClose: (shouldCloseAll: boolean) => void;
  userDocumentId: string;
  onDeleted: () => void;
}

const ModalDescartation: React.FC<ModalDescartationProps> = ({ onClose, userDocumentId, onDeleted }) => {
  const router = useRouter();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleSubmit = () => {
    setIsConfirmationOpen(true); // Abre o modal de confirmação
  };

  const handleCancel = () => {
    onClose(false); // Fecha apenas o modal de exclusão
  };

  const closeConfirmationModal = async () => {
    try {
      // Chama a API para deletar o usuário usando o documentId
      await deleteUser(userDocumentId);
      // Notifica o componente pai para atualizar a lista de clientes
      onDeleted();
      // Fecha o modal e redireciona para a página de clientes
      onClose(true);
      router.push('/clientes');
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      // Aqui você pode tratar o erro (exibir uma toast ou modal de erro)
    }
  };

  return (
    <>
      <ModalOverlay>
        <ModalBox>
          <ModalContent>
            <Image src={ExcludeIcon} width={60} height={60} alt="Check Icon" />
            <ModalText>Deseja excluir o cliente?</ModalText>
            <ModalButtons>
              <Button
                text="Não"
                type="button"
                variant="outline"
                className="red"
                width="100px"
                height="39px"
                onClick={handleCancel}
              />
              <Button
                text="Sim"
                type="button"
                variant="red"
                width="100px"
                height="39px"
                onClick={handleSubmit}
              />
            </ModalButtons>
          </ModalContent>
        </ModalBox>
      </ModalOverlay>
      {isConfirmationOpen && <ModalConfirmation onClose={closeConfirmationModal} />}
    </>
  );
};

export default ModalDescartation;
