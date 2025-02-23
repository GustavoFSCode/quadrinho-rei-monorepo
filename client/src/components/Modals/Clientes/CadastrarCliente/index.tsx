// components/ModalCadastrarCliente.tsx
import RegisterForm from "@/components/Forms/RegisterForm/RegisterForm";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody
} from './styled';
import Closed from "@/components/icons/Closed";


interface ModalCadastrarClienteProps {
  onClose: () => void;
}

const ModalCadastrarCliente: React.FC<ModalCadastrarClienteProps> = ({ onClose }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Cadastrar Cliente
          <Closed onClick={onClose} />
        </ModalHeader>
        <ModalBody>
          <RegisterForm onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalCadastrarCliente;
