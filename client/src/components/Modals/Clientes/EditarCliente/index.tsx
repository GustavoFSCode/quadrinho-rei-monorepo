// ModalEditarCliente.tsx
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody
} from './styled';
import Closed from "@/components/icons/Closed";
import EditClientForm from "@/components/Forms/EditClientForm/EditClientForm";

interface ModalEditarClienteProps {
  onClose: () => void;
  data: any; // Recebe o objeto de usuário fake
}

const ModalEditarCliente: React.FC<ModalEditarClienteProps> = ({ onClose, data }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Editar Cliente
          <Closed onClick={onClose} />
        </ModalHeader>
        <ModalBody>
          {/* Passamos os dados do cliente para o form */}
          <EditClientForm onClose={onClose} data={data} />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalEditarCliente;
