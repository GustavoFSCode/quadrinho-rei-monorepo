import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { CheckboxLabel, Container, StyledInput } from './styles';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: ReactNode | string;
  inverted?: boolean;
}

const Checkbox2 = forwardRef<HTMLInputElement, Props>(
  ({ label, id, inverted, ...rest }, ref) => {
    return (
      <Container>
        <StyledInput id={id} type="checkbox" {...rest} ref={ref} />
        <CheckboxLabel $inverted={inverted === true} htmlFor={id}>
          {label}
        </CheckboxLabel>
      </Container>
    );
  },
);

export default Checkbox2;
