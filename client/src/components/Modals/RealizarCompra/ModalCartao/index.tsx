import React from 'react';
import { ModalOverlay, ModalContent, ModalHeader, ModalBody } from './styled';
import Closed from '@/components/icons/Closed';
import NewCardForm from '@/components/Forms/NewCardForm/NewCardForm';

interface ModalCartaoProps {
  onClose: () => void;
  onCardsRefresh: () => Promise<void>;
  clientDocumentId: string;
}

const ModalCartao: React.FC<ModalCartaoProps> = ({
  onClose,
  onCardsRefresh,
  clientDocumentId,
}) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Novo Cartão
          <Closed onClick={onClose} name="closeCards" />
        </ModalHeader>
        <ModalBody>
          <NewCardForm
            clientDocumentId={clientDocumentId}
            onCardsRefresh={onCardsRefresh}
          />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalCartao;
