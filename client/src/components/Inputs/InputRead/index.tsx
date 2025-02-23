// InputRead.tsx
import React from "react";
import { ReadOnlyInputWrapper, ReadOnlyIconWrapper, ReadOnlyStyledInput } from "./styled";
import { PadlockIcon } from "@/components/icons/Padlock";

export interface InputReadProps {
  id?: string;
  name: string;
  label?: string;
  width?: string;
  height?: string;
  value?: string;
  placeholder?: string;
  textAlign?: string;
}

const InputRead: React.FC<InputReadProps> = ({
  id,
  name,
  label,
  value,
  width,
  height,
  placeholder,
  textAlign = "left",
  ...rest
}) => {
  return (
    <ReadOnlyInputWrapper width={width}>
      {label && <label htmlFor={id || name}>{label}</label>}
      <ReadOnlyIconWrapper>
        <PadlockIcon />
      </ReadOnlyIconWrapper>
      <ReadOnlyStyledInput
        id={id}
        name={name}
        type="text"
        value={value}
        placeholder={placeholder}
        readOnly
        hasIcon
        textAlign={textAlign}
        {...rest}
      />
    </ReadOnlyInputWrapper>
  );
};

export default InputRead;
