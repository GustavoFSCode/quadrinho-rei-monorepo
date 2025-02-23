import React, {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  useState,
} from 'react';
import {
  CloseButton,
  Container,
  ImageContainer,
  StyledImage,
  StyledInput,
} from './styles';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  image?: string | File;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputImage = forwardRef<HTMLInputElement, Props>(
  ({ id, error, image, disabled, onChange, ...rest }, ref) => {
    const [src, setSrc] = useState<string | undefined>(
      image instanceof File ? URL.createObjectURL(image) : image,
    );

    function handleImage(e: ChangeEvent<HTMLInputElement>) {
      if (e.currentTarget.files !== null && e.currentTarget.files?.length > 0) {
        const file = e.currentTarget.files[0];
        onChange(e);
        setSrc(URL.createObjectURL(file));
      }
    }
    return (
      <Container>
        {src !== undefined && !disabled && (
          <CloseButton
            type="button"
            disabled={disabled}
            onClick={() => setSrc(undefined)}
          />
        )}
        <ImageContainer $hasimage={!src} htmlFor={id}>
          {src !== undefined && <StyledImage src={src} alt="Foto de Perfil" />}
          <StyledInput
            id={id}
            type="file"
            disabled={disabled}
            onChange={handleImage}
            {...rest}
            ref={ref}
          />
        </ImageContainer>
      </Container>
    );
  },
);

export default InputImage;
