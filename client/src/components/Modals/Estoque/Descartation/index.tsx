import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ModalOverlay,
  ModalBox,
  ModalContent,
  ModalButtons,
  ModalText,
} from './styled';
import Button from '@/components/Button';
import Image from 'next/image';
import ExcludeIcon from '../../../icons/ExcludeBox.png';
import ModalConfirmation from '../Confirmation';
import { deleteProduct } from '@/services/productService';
import { toast } from 'react-toastify';

interface ModalDescartationProps {
  onClose: (shouldCloseAll: boolean) => void;
  userDocumentId: string;
  onDeleted: () => void;
}

const ModalDescartation: React.FC<ModalDescartationProps> = ({
  onClose,
  userDocumentId,
  onDeleted,
}) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      await deleteProduct(userDocumentId);
      onDeleted();
      setIsConfirmationOpen(true);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Não foi possível excluir o produto.');
      onClose(false);
    }
  };

  const closeConfirmationModal = () => {
    setIsConfirmationOpen(false);
    onClose(true);
  };

  return (
    <>
      <ModalOverlay>
        <ModalBox>
          <ModalContent>
            <Image src={ExcludeIcon} width={60} height={60} alt="Check Icon" />
            <ModalText>Deseja excluir o produto?</ModalText>
            <ModalButtons>
              <Button
                text="Não"
                type="button"
                variant="outline"
                className="red"
                width="100px"
                height="39px"
                onClick={() => onClose(false)}
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
      {isConfirmationOpen && (
        <ModalConfirmation onClose={closeConfirmationModal} />
      )}
    </>
  );
};

export default ModalDescartation;
