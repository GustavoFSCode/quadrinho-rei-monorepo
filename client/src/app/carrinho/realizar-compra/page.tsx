'use client';

import React, { useState } from 'react';
import {
  ContentContainer,
  Header,
  HeaderTop,
  HeaderTitle,
  Content,
  SectionTitle,
  SubSectionTitle,
  StyledParagraph,
} from './styled';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/realizar-compra';
import { Flex } from '@/styles/global';
import Button from '@/components/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes placeholders (a serem implementados futuramente)
import CupomForm from '@/components/Forms/CupomForm/CupomForm';
import EnderecoEntregaList from '@/components/EnderecoEntregaList';
import EnderecoCobrancaList from '@/components/EnderecoCobrancaList';
import CartaoList from '@/components/CartaoList';
import ModalEndereco from '@/components/Modals/RealizarCompra/ModalEndereco';
import ModalCartao from '@/components/Modals/RealizarCompra/ModalCartao';
import { clientDocumentId } from '@/config/documentId';

const RealizarCompra: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [paymentTotal, setPaymentTotal] = useState<number>(0);

  const [showModalEndereco, setShowModalEndereco] = useState<boolean>(false);
  const [showModalCartao, setShowModalCartao] = useState<boolean>(false);

  const handleFinalizarCompra = (): void => {
    toast.success('Compra finalizada com sucesso!');
  };

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Realizar compra</HeaderTitle>
          </HeaderTop>
        </Header>
        <Content>
          <Flex $direction="column" $gap="1rem">
            <Flex $direction="column" $gap="1rem">
              <SectionTitle>Cupons</SectionTitle>
              <CupomForm />
            </Flex>
            <Flex $direction="column" $gap="1rem">
              <SectionTitle>
                Endereço
                <span>-</span>
                <Button
                  text="Adicionar endereço"
                  type="button"
                  width="170px"
                  height="40px"
                  variant="purple"
                  onClick={() => setShowModalEndereco(true)}
                />
              </SectionTitle>
              <Flex $direction="column" $gap="1rem">
                <SubSectionTitle>Endereço de entrega</SubSectionTitle>
                <EnderecoEntregaList />
              </Flex>
              <Flex $direction="column" $gap="1rem">
                <SubSectionTitle>Endereço de cobrança</SubSectionTitle>
                <EnderecoCobrancaList />
              </Flex>
            </Flex>
            <Flex $direction="column" $gap="1rem">
              <SectionTitle>
                Cartão
                <span>-</span>
                <Button
                  text="Adicionar cartão"
                  width="150px"
                  height="40px"
                  type="button"
                  variant="purple"
                  onClick={() => setShowModalCartao(true)}
                />
              </SectionTitle>
              <CartaoList
                onTotalChange={setPaymentTotal}
                totalOrder={totalValue}
              />
            </Flex>
            <Flex $direction="row" $gap="2rem">
              <Tabela onTotalChange={setTotalValue} />
              <Flex $direction="column" $gap="20px" $justify="center">
                <StyledParagraph>
                  Valor total de pagamento:{' '}
                  {paymentTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </StyledParagraph>
                <StyledParagraph>
                  Valor total do pedido:{' '}
                  {totalValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </StyledParagraph>
                <Button
                  text="Finalizar compra"
                  type="button"
                  variant="purple"
                  onClick={handleFinalizarCompra}
                  disabled={paymentTotal !== totalValue}
                />
              </Flex>
            </Flex>
          </Flex>
        </Content>
      </ContentContainer>
      {showModalEndereco && (
        <ModalEndereco
          onClose={() => setShowModalEndereco(false)}
          onAddressRefresh={async () => {
            // Lógica para atualizar a lista de enderecos (caso necessário)
          }}
          clientDocumentId={clientDocumentId}
        />
      )}
      {showModalCartao && (
        <ModalCartao
          onClose={() => setShowModalCartao(false)}
          onCardsRefresh={async () => {
            // Lógica para atualizar a lista de cartões (caso necessário)
          }}
          clientDocumentId={clientDocumentId}
        />
      )}
      <ToastContainer />
    </>
  );
};

export default RealizarCompra;
