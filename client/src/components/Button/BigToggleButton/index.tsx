import React, { useState } from 'react';
import { ToggleWrapper, Label, ToggleContainer, ToggleCircle, ToggleText } from './styled';

interface ToggleButtonProps {
  label?: string;
  initialState?: boolean;
  onChange?: (state: boolean) => void;
  readOnly?: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  initialState = false,
  onChange,
  readOnly = false,
}) => {
  const [isActive, setIsActive] = useState(initialState);

  const handleToggle = () => {
    if (readOnly) return; // Impede a mudança de estado se readOnly for true
    const newState = !isActive;
    setIsActive(newState);
    if (onChange) {
      onChange(newState);
    }
  };

  return (
    <ToggleWrapper>
      {label && <Label>{label}</Label>}
      <ToggleContainer 
      isActive={isActive} 
      onClick={handleToggle} 
      readOnly={readOnly}>
        <ToggleText>{isActive ? 'Ativado' : 'Desativado'}</ToggleText>
        <ToggleCircle isActive={isActive} />
      </ToggleContainer>
    </ToggleWrapper>
  );
};

export default ToggleButton;
