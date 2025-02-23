import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody
} from './styled';
import Closed from "@/components/icons/Closed";
import EditClientForm from "@/components/Forms/EditClientForm/EditClientForm";


interface ModalEditarCartaoProps {
  onClose: () => void;
  data: any;
}

const ModalEditarCartao: React.FC<ModalEditarCartaoProps> = ({ onClose }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Editar Cartão
          <Closed onClick={onClose} />
        </ModalHeader>
        <ModalBody>
          <EditClientForm onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalEditarCartao;
