import { useState } from "react";
import {
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBodyTop,
    ModalBodyBottom,
    ModalFooter,
    RadioBox,
    RadioTitle,
    RadioGroup,
    RadioButton
} from './styled';
import Button from '@/components/Button';
import ModalConfirmation from "./Confirmation";
import ModalDescartation from "./Descartation";

interface ModalEditarAdministradorProps {
    onClose: () => void;
    data: {
        nome: string;
        email: string;
        acesso: string;
    };
}

const ModalEditarCliente: React.FC<ModalEditarAdministradorProps> = ({ onClose, data }) => {
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [isDescartationModalOpen, setIsDescartationModalOpen] = useState(false);

    const handleSubmit = () => {
        setIsConfirmationModalOpen(true);
    };

    const handleCancel = () => {
        // Abre o modal de descarte ao clicar em "Cancelar"
        setIsDescartationModalOpen(true);
    };

    const handleConfirmationClose = () => {
        setIsConfirmationModalOpen(false);
        onClose();
    };

    const handleDescartationClose = (shouldCloseAll: boolean) => {
        setIsDescartationModalOpen(false);
        if (shouldCloseAll) {
            onClose(); // Fecha o modal principal
        }
    };


    return (
        <>
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>Editar Cliente</ModalHeader>

                <ModalFooter>
                    <Button
                        text="Cancelar"
                        type="button"
                        variant="outline"
                        width='150px'
                        height='44px'
                        onClick={handleCancel}
                    />
                    <Button
                        text="Salvar"
                        type="button"
                        variant="purple"
                        width='150px'
                        height='44px'
                        onClick={handleSubmit}
                    />
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
            {isConfirmationModalOpen && (
                <ModalConfirmation onClose={handleConfirmationClose} />
            )}

            {isDescartationModalOpen && (
                <ModalDescartation onClose={(shouldCloseAll) => handleDescartationClose(shouldCloseAll)} />
            )}
        </>
    );
};

export default ModalEditarCliente;
