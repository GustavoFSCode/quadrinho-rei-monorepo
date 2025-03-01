// components/Modals/Clientes/EditarCliente.tsx
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody
} from './styled';
import Closed from "@/components/icons/Closed";
import EditClientForm from "@/components/Forms/EditClientForm/EditClientForm";
import { Client } from '@/services/clientService';

interface ModalEditarClienteProps {
  onClose: () => void;
  data: Client;
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
          {/* Passa os dados do cliente para o form */}
          <EditClientForm onClose={onClose} data={data} />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalEditarCliente;
