// ToggleButton.tsx
import React from "react";
import { ToggleWrapper, ToggleSwitch, ToggleCircle } from "./styled";

interface ToggleButtonProps {
  isActive: boolean;
  onToggle: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isActive, onToggle }) => {
  return (
    <ToggleWrapper onClick={onToggle}>
      <ToggleSwitch isActive={isActive}>
        <ToggleCircle isActive={isActive} />
      </ToggleSwitch>
    </ToggleWrapper>
  );
};

export default ToggleButton;
