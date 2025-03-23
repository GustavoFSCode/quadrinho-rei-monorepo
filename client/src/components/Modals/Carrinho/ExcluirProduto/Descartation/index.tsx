// components/Modals/Clientes/ExcluirProduto/ModalDescartation.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModalOverlay, ModalBox, ModalContent, ModalButtons, ModalText } from './styled';
import Button from '@/components/Button';
import Image from 'next/image';
import ExcludeIcon from '../../../../icons/ExcludeBox.png';
import ModalConfirmation from '../Confirmation';
// Removemos a importação da API
// import { deleteUser } from '@/services/clientService';

interface ModalDescartationProps {
  onClose: (shouldCloseAll: boolean) => void;
  userDocumentId: string;
  onDeleted: () => void;
}

const ModalDescartation: React.FC<ModalDescartationProps> = ({ onClose, userDocumentId, onDeleted }) => {
  const router = useRouter();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Abre o modal de confirmação
  const handleSubmit = () => {
    setIsConfirmationOpen(true);
  };

  // Fecha apenas o modal de descarte
  const handleCancel = () => {
    onClose(false);
  };

  // Função que simula a exclusão e fecha os modais, sem chamadas à API
  const closeConfirmationModal = () => {
    // Simula a lógica de "exclusão" (mock)
    onDeleted();
    setIsConfirmationOpen(false);
    onClose(true);
    // A navegação pode ser realizada no ModalConfirmation, conforme abaixo
  };

  return (
    <>
      <ModalOverlay>
        <ModalBox>
          <ModalContent>
            <Image src={ExcludeIcon} width={60} height={60} alt="Check Icon" />
            <ModalText>Deseja remover o produto do seu carrinho?</ModalText>
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
