import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import {
  ErrorMessage,
  InputContainer,
  Label,
  Small,
  StyledFlex,
  StyledTextarea,
} from './styles';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  label_description?: string;
  error?: string;
  maxwidth?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  (
    { label, label_description, error, id, maxwidth, onChange, ...rest },
    ref,
  ) => {
    return (
      <StyledFlex $direction="column" $gap="0.3125rem" $maxwidth={maxwidth}>
        <Label htmlFor={id}>
          {label}
          {label_description && <Small>{` ${label_description}`}</Small>}
        </Label>
        <InputContainer>
          <StyledTextarea id={id} onChange={onChange} ref={ref} {...rest} />
        </InputContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </StyledFlex>
    );
  },
);

export default Textarea;
