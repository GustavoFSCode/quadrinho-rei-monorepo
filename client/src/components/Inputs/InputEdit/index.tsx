// InputEdit/index.tsx
import React, { useState, useEffect } from "react";
import {
  EditInputWrapper,
  EditLabel,
  EditStyledInput,
  EditButton
} from "./styled";
import Pencil from "@/components/icons/Pencil";
import { CheckIcon } from "@/components/icons/Check";

export interface InputEditProps {
  id?: string;
  name: string;
  label?: string;
  width?: string;
  height?: string;
  value: string; // Mantém como string para formatação
  placeholder?: string;
  onChange?: (value: string) => void; // Recebe string formatada
}

const formatPhoneNumber = (value: string): string => {
  // Remove todos os caracteres que não são dígitos
  const cleaned = value.replace(/\D/g, "");

  // Limita a 11 dígitos
  const limited = cleaned.substring(0, 11);

  // Formata conforme o padrão (XX) XXXXX-XXXX
  let formatted = "";

  if (limited.length > 0) {
    formatted += "(";
  }
  if (limited.length >= 1) {
    formatted += limited.substring(0, Math.min(2, limited.length));
  }
  if (limited.length >= 2) {
    formatted += ") ";
  }
  if (limited.length > 2) {
    formatted += limited.substring(2, Math.min(7, limited.length));
  }
  if (limited.length > 7) {
    formatted += "-" + limited.substring(7, Math.min(11, limited.length));
  }

  return formatted;
};

const InputEdit: React.FC<InputEditProps> = ({
  id,
  name,
  label,
  width,
  height,
  value,
  placeholder,
  onChange,
  ...rest
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState<string>(value);

  useEffect(() => {
    // Formata o valor inicial ao montar o componente
    setCurrentValue(formatPhoneNumber(value));
  }, [value]);

  const handleToggleEdit = () => {
    if (isEditing) {
      setIsEditing(false);
      if (onChange) {
        onChange(currentValue);
      }
    } else {
      // Inicia a edição
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setCurrentValue(formatted);
    if (onChange) {
      onChange(formatted);
    }
  };

  return (
    <EditInputWrapper width={width}>
      {label && <EditLabel htmlFor={id || name}>{label}</EditLabel>}
      <EditStyledInput
        id={id}
        name={name}
        type="text" // Tipo text para permitir formatação
        value={currentValue}
        placeholder={placeholder}
        readOnly={!isEditing}
        isEditing={isEditing}
        onChange={handleChange}
        {...rest}
      />
      <EditButton type="button" onClick={handleToggleEdit}>
        {isEditing ? <CheckIcon /> : <Pencil />}
      </EditButton>
    </EditInputWrapper>
  );
};

export default InputEdit;
