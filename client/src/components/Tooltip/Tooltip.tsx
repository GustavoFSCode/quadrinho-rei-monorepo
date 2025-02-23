import React from 'react';
import { Image } from '@/styles/global';
import { Container, Message } from './styles';

interface Props {
  message: string;
}

const Tooltip = ({ message }: Props) => {
  return (
    <Container>
      <Image src="/img/info.svg" alt="Informação" />
      <Message>{message}</Message>
    </Container>
  );
};

export default Tooltip;
