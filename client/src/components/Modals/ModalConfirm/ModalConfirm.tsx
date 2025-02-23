import React from 'react';
import { Flex } from '@/styles/global';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import { Box, BoxOverflow, Container } from '../styles';
import {
  Closebutton,
  Description,
  StyledContainer,
  Title,
  Value,
} from './styles';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

const ModalConfirm = ({ onClose, onConfirm }: Props) => {
  return (
    <Container>
      <Box $maxwidth="600px" $maxheight="425px">
        <Closebutton type="button" onClick={onClose} />
        <BoxOverflow>
          <StyledContainer>
            <Flex $direction="column" $gap="4.375rem">
              <Title>Confirme as informações</Title>
              <Flex $direction="column" $gap="1.25rem">
                <Flex $direction="column" $gap="0.625rem">
                  <Description>Quantidade de Grãos de bingo</Description>
                  <Value>120</Value>
                </Flex>
                <Flex $direction="column" $gap="0.625rem">
                  <Description>Valor total</Description>
                  <Value>R$ 120,00</Value>
                </Flex>
              </Flex>
              <Flex $justify="center">
                <ButtonPrimary
                  type="button"
                  maxwidth="9.375rem"
                  onClick={onConfirm}
                >
                  Confirmar
                </ButtonPrimary>
              </Flex>
            </Flex>
          </StyledContainer>
        </BoxOverflow>
      </Box>
    </Container>
  );
};

export default ModalConfirm;
