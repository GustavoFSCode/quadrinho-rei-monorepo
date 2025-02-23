import React from "react";
import { InputWrapper, Label, StyledInput } from "./styled";

interface InputDateProps {
  id?: string;
  name: string;
  label?: string;
  width?: string;
  height?: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputDate = ({
  id,
  name,
  label,
  width,
  height,
  value,
  placeholder = "DD/MM/AAAA",
  readOnly = false,
  onChange,
  onBlur,
  ...rest
}: InputDateProps) => {
  return (
    <InputWrapper width={width}>
      {label && <Label htmlFor={id || name}>{label}</Label>}

      <StyledInput
        id={id}
        name={name}
        type="date"
        placeholder={placeholder}
        width={width}
        height={height}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        {...rest}
      />
    </InputWrapper>
  );
};

export default InputDate;
