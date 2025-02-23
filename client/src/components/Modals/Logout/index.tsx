import { ModalOverlay, ModalBox, ModalContent, ModalButtons, ModalText } from './styled';
import Button from '@/components/Button';
import Image from 'next/image';
import ExcludeIcon from '../../icons/ExcludeBox.png';

interface ModalLogoutProps {
  onClose: (shouldLogout: boolean) => void;
}

const ModalLogout: React.FC<ModalLogoutProps> = ({ onClose }) => {

  const handleConfirm = () => {
    onClose(true); // Usuário confirmou que deseja sair
  };

  const handleCancel = () => {
    onClose(false); // Usuário cancelou a saída
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
