import React, { useState } from "react";
import { ToggleWrapper, ToggleSwitch, ToggleCircle } from "./styled";

// Componente ToggleButton
const ToggleButton: React.FC = () => {
  const [isActive, setIsActive] = useState(true);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <ToggleWrapper onClick={handleToggle}>
      <ToggleSwitch isActive={isActive}>
        <ToggleCircle isActive={isActive} />
      </ToggleSwitch>
    </ToggleWrapper>
  );
};

export default ToggleButton;
