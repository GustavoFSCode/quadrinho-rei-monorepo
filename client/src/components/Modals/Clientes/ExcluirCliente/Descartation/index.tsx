import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModalOverlay, ModalBox, ModalContent, ModalButtons, ModalText } from './styled';
import Button from '@/components/Button';
import Image from 'next/image';
import ExcludeIcon from '../../../../icons/ExcludeBox.png';
import ModalConfirmation from '../Confirmation';

interface ModalDescartationProps {
    onClose: (shouldCloseAll: boolean) => void;
}

const ModalDescartation: React.FC<ModalDescartationProps> = ({ onClose }) => {
    const router = useRouter();
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // Novo estado para o modal de confirmação

    const handleSubmit = () => {
        setIsConfirmationOpen(true); // Abre o modal de confirmação
    };

    const handleCancel = () => {
        onClose(false); // Indica que deve fechar apenas o modal de descarte
    };

    const closeConfirmationModal = () => {
        onClose(true); // Fecha todos os modais
        router.push('/clientes'); // Redireciona após fechar o modal principal
    };

    return (
        <>
            <ModalOverlay>
                <ModalBox>
                    <ModalContent>
                        <Image src={ExcludeIcon} width={60} height={60} alt="Check Icon" />
                        <ModalText>Deseja excluir o cliente?</ModalText>
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
            {isConfirmationOpen && <ModalConfirmation onClose={closeConfirmationModal} />} {/* Renderiza o modal de confirmação */}
        </>
    );
}

export default ModalDescartation;
