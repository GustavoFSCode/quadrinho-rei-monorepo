import { forwardRef, InputHTMLAttributes } from 'react';
import {
  Container,
  DecrementButton,
  IncrementButton,
  StyledInput,
} from './styles';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  setValue: (value: number) => void;
  value: number;
  max?: number;
}

const InputNumber = forwardRef<HTMLInputElement, Props>(
  ({ value, setValue, max = 99, ...rest }, ref) => {
    function handleDecrement() {
      if (value > 1) {
        setValue(value - 1);
      }
    }

    function handleIncrement() {
      if (value < max) {
        setValue(value + 1);
      }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      let newValue = Number(e.target.value);
      // Caso o valor digitado seja maior que o max, define para max.
      if (newValue > max) {
        newValue = max;
      }
      // Garante que o valor mínimo seja 1.
      if (newValue < 1) {
        newValue = 1;
      }
      setValue(newValue);
    }

    return (
      <Container>
        <DecrementButton type="button" onClick={handleDecrement} />
        <StyledInput
          type="number"
          value={value}
          min={1}
          max={max}
          onChange={handleChange}
          {...rest}
          ref={ref}
        />
        <IncrementButton type="button" onClick={handleIncrement} />
      </Container>
    );
  },
);

export default InputNumber;
