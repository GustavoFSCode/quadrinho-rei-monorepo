import React, { ChangeEvent } from 'react';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Container, Label, StyledInput } from './styles';

interface Props {
  id: string;
  label: string;
  value: string;
  checked: boolean;
  tooltip_message?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputRadio = ({
  id,
  label,
  value,
  checked,
  tooltip_message,
  onChange,
}: Props) => {
  return (
    <Container>
      <StyledInput
        id={id}
        type="radio"
        checked={checked}
        value={value}
        onChange={onChange}
      />
      <Label htmlFor={id}>
        {label} {tooltip_message && <Tooltip message={tooltip_message} />}
      </Label>
    </Container>
  );
};

export default InputRadio;
