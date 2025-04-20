// components/Button/ToggleTable.tsx
import React from 'react';
import { ToggleWrapper, ToggleSwitch, ToggleCircle } from './styled';

interface ToggleButtonProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onToggle,
  disabled = false,
}) => {
  return (
    <ToggleWrapper
      onClick={() => {
        if (disabled) return;
        onToggle();
      }}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <ToggleSwitch isActive={isActive}>
        <ToggleCircle isActive={isActive} />
      </ToggleSwitch>
    </ToggleWrapper>
  );
};

export default ToggleButton;
