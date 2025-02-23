import React, { useState, useRef, useEffect } from 'react';
import {
  DropdownContainer,
  DropdownHeader,
  DropdownList,
  DropdownItem,
  HiddenRadio,
  DropdownLabel,
  DropdownArrow,
  CustomBox,
  PersonalizedTittle,
  PersonalizedInput,
  PersonalizedButton
} from './styled';
import ShapeUp from '@/components/icons/ShapeUp';
import ShapeDown from '@/components/icons/ShapeDown';
import Button from '@/components/Button';
import InputDate from '@/components/Inputs/InputDate';

const options = [
  'Último dia',
  'Últimos 15 dias',
  'Último mês',
  'Últimos 6 meses',
  'Último ano',
  'Personalizado',
];

const largeWidthOptions = new Set(['Últimos 15 dias', 'Últimos 6 meses', 'Personalizado']);

const PeriodDropdown: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (option !== 'Personalizado') {
      setIsExpanded(false);
    } else {
      setIsExpanded(true); // Mantém o dropdown aberto
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsExpanded(false);
    }
  };

  const handleConfirm = () => {
    setIsExpanded(false); // Fecha o dropdown e a CustomBox
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentWidth =
    selectedOption && largeWidthOptions.has(selectedOption) ? '210px' : '165px';

  const isCustomOptionSelected = selectedOption === 'Personalizado' && isExpanded;

  return (
    <div ref={containerRef} style={{ display: 'flex', position: 'relative' }}>
      <DropdownContainer
        className={isExpanded ? 'expanded' : ''}
        width={currentWidth}
        isCustomOptionSelected={isCustomOptionSelected}
      >
        <DropdownHeader onClick={toggleDropdown}>
          {selectedOption || 'Período'}
          <DropdownArrow>
            {isExpanded ? <ShapeUp /> : <ShapeDown />}
          </DropdownArrow>
        </DropdownHeader>
        {isExpanded && (
          <DropdownList
            width={currentWidth}
            isCustomOptionSelected={isCustomOptionSelected}
          >
            {options.map((option, index) => (
              <DropdownItem key={index}>
                <HiddenRadio
                  type="radio"
                  id={`option-${index}`}
                  name="period"
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => handleOptionSelect(option)}
                />
                <DropdownLabel
                  htmlFor={`option-${index}`}
                  isSelected={selectedOption === option && isExpanded}
                >
                  {option}
                </DropdownLabel>
              </DropdownItem>
            ))}
          </DropdownList>
        )}
      </DropdownContainer>

      {isCustomOptionSelected && (
        <CustomBox>
          <PersonalizedTittle>Período personalizado</PersonalizedTittle>
          <PersonalizedInput>
            <InputDate
              name='dateInitial'
              label='De'
              width='125px'
              height='37px'
            />
            <InputDate
              name='dateFinal'
              label='Até'
              width='125px'
              height='37px'
            />
          </PersonalizedInput>
          <PersonalizedButton>
            <Button
              text="Confirmar"
              type='button'
              variant='outline'
              width='125px'
              height='29px'
              onClick={handleConfirm} // Adicionamos o onClick aqui
            />
          </PersonalizedButton>
        </CustomBox>
      )}
    </div>
  );
};

export default PeriodDropdown;
