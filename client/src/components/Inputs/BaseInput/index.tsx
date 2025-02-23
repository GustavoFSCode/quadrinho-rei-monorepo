import React from "react";
import { InputWrapper, Label, StyledInput } from "./styled";

export interface BaseInputProps {
  id?: string;
  name: string;
  label?: string;
  width?: string;
  height?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  hasIcon?: boolean;
  icon?: React.ReactNode;
  textAlign?: string;
  [key: string]: any;
}

const BaseInput = ({
  id,
  name,
  label,
  type = "text",
  placeholder,
  width,
  height,
  value,
  onChange,
  onBlur,
  hasIcon,
  icon,
  textAlign = "left",
  ...rest
}: BaseInputProps) => {
  return (
    <InputWrapper width={width} hasIcon={hasIcon}>
      {label && <Label htmlFor={id || name}>{label}</Label>}

      {hasIcon && icon && <div className="icon-wrapper">{icon}</div>}

      <StyledInput
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        width={width}
        height={height}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        hasIcon={hasIcon}
        textAlign={textAlign}
        {...rest}
      />
    </InputWrapper>
  );
};

export default BaseInput;
