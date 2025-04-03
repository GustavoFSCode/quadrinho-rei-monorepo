import React from 'react';
import { ModalOverlay, ModalContent, ModalHeader, ModalBody } from './styled';
import Closed from '@/components/icons/Closed';
import NewAddressForm from '@/components/Forms/NewAddressForm/NewAddressForm';

interface ModalEnderecoProps {
  onClose: () => void;
  onAddressRefresh: () => Promise<void>;
  clientDocumentId: string;
}

const ModalEndereco: React.FC<ModalEnderecoProps> = ({
  onClose,
  onAddressRefresh,
  clientDocumentId,
}) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Novo Endereço
          <Closed onClick={onClose} name="closeAddress" />
        </ModalHeader>
        <ModalBody>
          <NewAddressForm
            clientDocumentId={clientDocumentId}
            onAddressRefresh={onAddressRefresh}
          />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalEndereco;
