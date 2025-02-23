import { useRouter } from 'next/navigation';
import { ModalOverlay, ModalBox, ModalContent, ModalButtons, ModalText } from './styled';
import Button from '@/components/Button';
import Image from 'next/image';
import ExcludeIcon from '../../../../icons/ExcludeBox.png';

interface ModalDescartationProps {
    onClose: (shouldCloseAll: boolean) => void;
}

const ModalDescartation: React.FC<ModalDescartationProps> = ({ onClose }) => {
    const router = useRouter();

    const handleSubmit = () => {
        onClose(true); // Indica que deve fechar todos os modais
        router.push('/administradores'); // Redireciona após fechar o modal principal
    };

    const handleCancel = () => {
        onClose(false); // Indica que deve fechar apenas o modal de descarte
    };

    return (
        <ModalOverlay>
            <ModalBox>
                <ModalContent>
                    <Image src={ExcludeIcon} width={60} height={60} alt="Check Icon" />
                    <ModalText>Descartar alterações?</ModalText>
                    <ModalButtons>
                        <Button 
                            text="Não"
                            type="button" 
                            variant="outline"
                            className='red'
                            width='100px'
                            height='39px' 
                            onClick={handleCancel} // Usa a função handleCancel
                        />
                        <Button 
                            text="Sim"
                            type="button" 
                            variant="red"
                            width='100px'
                            height='39px' 
                            onClick={handleSubmit}       
                        />
                    </ModalButtons>
                </ModalContent>
            </ModalBox>
        </ModalOverlay>
    );
}

export default ModalDescartation;
