import { forwardRef, InputHTMLAttributes } from 'react';
import { Input } from './styles';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  maskFunction?: (value: string) => string;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MaskedInput: React.ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { maskFunction, onChange, width, ...rest },
  ref,
) => {
  const handleMask = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (maskFunction) {
      const masked = maskFunction(event.target.value);
      event.target.value = masked;
    }
    onChange(event);
  };

  return (
    <Input
      type="text"
      className="form-control"
      onChange={(event: any) => handleMask(event)}
      {...rest}
      ref={ref}
    />
  );
};

export default forwardRef(MaskedInput);
