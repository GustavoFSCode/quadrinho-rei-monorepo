// src/components/Modals/Perfil/ModalSuccess.tsx

import { ModalOverlay, ModalBox, ModalContent, ModalText } from './styled';
import Button from '@/components/Button';
import Image from 'next/image';
import CheckIcon from '@/components/icons/CheckBox.png';

interface ModalSuccessProps {
    onClose: () => void;
}

const ModalSuccess: React.FC<ModalSuccessProps> = ({ onClose }) => {
    const handleContinue = () => {
        console.log('Senha Alterada!');
        onClose();
        // Nenhuma navegação ocorre aqui
    };

    return (
        <ModalOverlay>
            <ModalBox>
                <ModalContent>
                    <Image src={CheckIcon} width={60} height={60} alt="Check Icon" />
                    <ModalText>Senha alterada com sucesso!</ModalText>
                    <Button 
                        text="Continuar"
                        type="button" 
                        variant="green"
                        width='120px'
                        height='39px' 
                        onClick={handleContinue}       
                    />
                </ModalContent>
            </ModalBox>
        </ModalOverlay>
    );
}

export default ModalSuccess;
