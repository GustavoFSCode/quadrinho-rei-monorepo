import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import {
  Edit,
  ErrorMessage,
  InputContainer,
  Label,
  Lock,
  Search,
  ShowPasswordButton,
  Small,
  StyledFlex,
  StyledInput,
} from './styles';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  label_description?: string;
  error?: string;
  maxwidth?: string;
  editModal?: boolean;
  search?: boolean;
  editModalAction?: () => void;
  maskFunction?: (value: string) => string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hover?: boolean;
}

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      label_description,
      error,
      id,
      type,
      readOnly,
      disabled,
      maxwidth,
      editModal,
      search,
      editModalAction,
      maskFunction,
      onChange,
      hover,
      ...rest
    },
    ref,
  ) => {
    const [statedType, setStatedType] = useState(type);

    function handleInputType() {
      setStatedType(statedType === 'password' ? 'text' : 'password');
    }

    // Cria uma função de onChange que só chama a prop se ela estiver definida
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <StyledFlex $direction="column" $gap="0.3125rem" $maxwidth={maxwidth}>
        <Label htmlFor={id}>
          {label}
          {label_description && <Small>{` ${label_description}`}</Small>}
        </Label>
        <InputContainer>
          {search && <Search src="/img/lupa.svg" alt="Lupa" />}
          <StyledInput
            id={id}
            maskFunction={maskFunction}
            onChange={handleChange}
            readOnly={readOnly}
            disabled={disabled}
            ref={ref}
            $hover={hover}
            type={statedType}
            $paddingright={
              type === 'password' || editModal === true || readOnly === true
                ? '2.5rem'
                : '1.25rem'
            }
            $paddingleft={search === true ? '2.5rem' : '1.25rem'}
            {...rest}
          />
          {type === 'password' && !readOnly && (
            <ShowPasswordButton
              type="button"
              aria-description="Mostrar / Esconder senha"
              title="Mostrar / Esconder senha"
              $show={statedType === 'text'}
              onClick={handleInputType}
            />
          )}
          {editModal && (
            <Edit
              type="button"
              aria-description="Editar"
              title="Editar"
              disabled={disabled}
              onClick={editModalAction}
            />
          )}
          {readOnly}
        </InputContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </StyledFlex>
    );
  },
);

export default Input;
