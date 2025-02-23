import React, { ReactElement } from 'react';
import { Flex, Image } from '@/styles/global';
import { Box, Container } from '../styles';
import { TextBox, Text, TextSub } from './styles';

interface Props {
  gap?: string;
  maxwidth?: string;
  maxheight?: string;
  image: {
    url: string;
    alt?: string;
  };
  text: string;
  subText?: string;
  outlineButton?: ReactElement;
  solidButton?: ReactElement;
}

const Modal = ({
  gap,
  maxwidth,
  maxheight,
  image,
  text,
  subText,
  outlineButton,
  solidButton,
}: Props) => {
  return (
    <Container>
      <Box
        $gap={gap}
        $maxwidth={maxwidth || '24.375rem'}
        $maxheight={maxheight || '18.75rem'}
      >
        {image && (
          <Image
            $maxwidth="3.75rem"
            $maxheight="3.75rem"
            src={image.url}
            alt={image.alt}
          />
        )}
        <TextBox>
          {text && <Text>{text}</Text>}
          {subText && <TextSub>{subText}</TextSub>}
        </TextBox>

        <Flex $direction="column" $gap="3.1875rem">
          <Flex $justify="center" $wrap="wrap" $gap="1rem">
            {outlineButton}
            {solidButton}
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
};

export default Modal;
