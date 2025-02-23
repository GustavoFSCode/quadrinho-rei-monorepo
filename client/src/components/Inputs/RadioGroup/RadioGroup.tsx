import React, { ChangeEvent } from 'react';
import { Container, Group, Span } from './styles';
import InputRadio from '../InputRadio/InputRadio';

interface IInput {
  id: string;
  label: string;
  value: string;
  tooltip_message?: string;
}

interface Props {
  title: string;
  value: string;
  onChange: (e: any) => void;
  inputs: IInput[];
}

const RadioGroup = ({ title, value, inputs, onChange }: Props) => {
  function handleChangeValue(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }
  return (
    <Container>
      <Span>{title}</Span>
      <Group>
        {inputs.map(item => (
          <InputRadio
            key={item.id}
            id={item.id}
            label={item.label}
            value={item.value}
            checked={value === item.value}
            tooltip_message={item.tooltip_message}
            onChange={handleChangeValue}
          />
        ))}
      </Group>
    </Container>
  );
};

export default RadioGroup;
