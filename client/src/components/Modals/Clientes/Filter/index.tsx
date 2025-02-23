import React, { useState, useEffect } from 'react';
import {
    FilterModalContainer,
    ModalHeader,
    ModalTitle,
    ModalContent,
    RadioBox,
    RadioTitle,
    RadioGroup,
    RadioButton,
    ModalFooter,
    ArrowWrapper
} from './styled';
import Button from '@/components/Button';
import Closed from '@/components/icons/Closed';
import UpArrow from '@/components/icons/UpArrow';
import DownArrow from '@/components/icons/DownArrow';

interface FormData {
    acesso: string[];
}

interface FilterModalProps {
    onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose }) => {
    const [formData, setFormData] = useState<FormData>({ acesso: [] });
    const [isExpanded, setIsExpanded] = useState(false); // Estado para controlar a expansão

    // Estado para controlar a visibilidade do modal
    const [isVisible, setIsVisible] = useState(false);

    // Define isVisible como true ao montar o componente
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const animationDuration = 300; // Duração da animação em milissegundos

    // Chama onClose após a animação de saída
    useEffect(() => {
        if (!isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, animationDuration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    // Manipula o fechamento do modal
    const handleClose = () => {
        setIsVisible(false);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        setFormData(prevData => {
            if (checked) {
                return { ...prevData, acesso: [...prevData.acesso, value] };
            } else {
                return { ...prevData, acesso: prevData.acesso.filter(item => item !== value) };
            }
        });
    };

    const clearFilters = () => {
        setFormData({ acesso: [] });
        console.log('Filtros limpos');
    };

    const toggleExpand = () => {
        setIsExpanded(prevState => !prevState);
    };

    return (
        <FilterModalContainer isVisible={isVisible}>
            <ModalHeader>
                <ModalTitle>Filtros</ModalTitle>
                <Closed onClick={handleClose} />
            </ModalHeader>
            <ModalContent>
                <RadioBox>
                    <RadioTitle>
                        Acesso
                        <ArrowWrapper onClick={toggleExpand}>
                            {isExpanded ? <UpArrow /> : <DownArrow />}
                        </ArrowWrapper>
                    </RadioTitle>
                    <RadioGroup isExpanded={isExpanded}>
                        {['Suporte', 'Jogos', 'Financeiro', 'Admin'].map(option => (
                            <RadioButton key={option}>
                                <input 
                                    type="checkbox" 
                                    name="acesso" 
                                    value={option} 
                                    checked={formData.acesso.includes(option)}
                                    onChange={handleInputChange}
                                />
                                {option}
                            </RadioButton>
                        ))}
                    </RadioGroup>
                </RadioBox>
            </ModalContent>
            <ModalFooter>
                <Button 
                    text="Limpar" 
                    variant="outline" 
                    type="button" 
                    width="80px" 
                    height="36px" 
                    onClick={clearFilters}
                />
            </ModalFooter>
        </FilterModalContainer>
    );
};

export default FilterModal;
