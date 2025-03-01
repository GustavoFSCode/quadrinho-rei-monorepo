import { ModalOverlay, ModalBox, ModalContent, ModalButtons, ModalText } from './styled';
import Button from '@/components/Button';
import Image from 'next/image';
import ExcludeIcon from '../../icons/ExcludeBox.png';
import { useAuth } from '@/hooks/useAuth'; // Importa o hook de autenticação

interface ModalLogoutProps {
  onClose: (shouldLogout: boolean) => void;
}

const ModalLogout: React.FC<ModalLogoutProps> = ({ onClose }) => {
  const { logout } = useAuth(); // Obtém a função logout do contexto

  const handleConfirm = () => {
    logout(); // Executa a função de logout (remove tokens e dados do usuário)
    onClose(true); // Fecha o modal informando que o usuário confirmou o logout
  };

  const handleCancel = () => {
    onClose(false); // Fecha o modal sem realizar logout
  };

  return (
    <ModalOverlay>
      <ModalBox>
        <ModalContent>
          <Image src={ExcludeIcon} width={60} height={60} alt="Check Icon" />
          <ModalText>Tem certeza que deseja sair?</ModalText>
          <ModalButtons>
            <Button
              text="Não"
              type="button"
              variant="outline"
              className='red'
              width='100px'
              height='39px'
              onClick={handleCancel}
            />
            <Button
              text="Sim"
              type="button"
              variant="red"
              width='100px'
              height='39px'
              onClick={handleConfirm}
            />
          </ModalButtons>
        </ModalContent>
      </ModalBox>
    </ModalOverlay>
  );
}

export default ModalLogout;
