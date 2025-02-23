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
}

const InputNumber = forwardRef<HTMLInputElement, Props>(
  ({ value, setValue, ...rest }, ref) => {
    function handleDecrement() {
      console.log(value);
      if (value > 1) {
        setValue(value - 1);
      }
    }

    function handleIncrement() {
      console.log(value);
      if (value < 99) {
        setValue(value + 1);
      }
    }

    return (
      <Container>
        <DecrementButton type="button" onClick={handleDecrement} />
        <StyledInput
          type="number"
          value={value}
          min={1}
          max={99}
          {...rest}
          ref={ref}
        />
        <IncrementButton type="button" onClick={handleIncrement} />
      </Container>
    );
  },
);

export default InputNumber;
