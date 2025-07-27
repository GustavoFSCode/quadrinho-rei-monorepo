// src/app/RealizarCompra/page.tsx (ou onde estiver seu componente)

'use client';

import React, { useState, useEffect } from 'react';
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
import Tabela from '@/components/Tables/Compra-Realizar';
import { Flex } from '@/styles/global';
import Button from '@/components/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CupomForm from '@/components/Forms/CupomForm/CupomForm';
import EnderecoEntregaList from '@/components/EnderecoEntregaList';
import EnderecoCobrancaList from '@/components/EnderecoCobrancaList';
import CartaoList from '@/components/CartaoList';
import ModalEndereco from '@/components/Modals/RealizarCompra/ModalEndereco';
import ModalCartao from '@/components/Modals/RealizarCompra/ModalCartao';
import { clientDocumentId } from '@/config/documentId';

import { useAuth } from '@/hooks/useAuth';
import { getUser, Address } from '@/services/clientService';

export default function RealizarCompra() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [paymentTotal, setPaymentTotal] = useState(0);

  const [showModalEndereco, setShowModalEndereco] = useState(false);
  const [showModalCartao, setShowModalCartao] = useState(false);

  // Carrega os dados do usuário e extrai endereços
  useEffect(() => {
    if (!user.documentId) return;
    (async () => {
      try {
        const fullUser = await getUser(user.documentId);
        setAddresses(fullUser.client.addresses);
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
      }
    })();
  }, [user.documentId]);

  const handleFinalizarCompra = () => {
    toast.success('Compra finalizada com sucesso!');
  };

  // Separe em cobranças e entregas
  const entrega = addresses.filter(a => a.TypeAddress === 'Entrega');
  const cobranca = addresses.filter(a => a.TypeAddress === 'Cobrança');

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
            <SectionTitle>Cupons</SectionTitle>
            <CupomForm />

            <SectionTitle>
              Endereço{' '}
              <span>-</span>{' '}
              <Button
                text="Adicionar endereço"
                type="button"
                width="170px"
                height="40px"
                variant="purple"
                onClick={() => setShowModalEndereco(true)}
              />
            </SectionTitle>

            <SubSectionTitle>Endereço de entrega</SubSectionTitle>
            <EnderecoEntregaList addresses={entrega} />

            <SubSectionTitle>Endereço de cobrança</SubSectionTitle>
            <EnderecoCobrancaList addresses={cobranca} />

            <SectionTitle>
              Cartão <span>-</span>{' '}
              <Button
                text="Adicionar cartão"
                width="150px"
                height="40px"
                type="button"
                variant="purple"
                onClick={() => setShowModalCartao(true)}
              />
            </SectionTitle>
            <CartaoList onTotalChange={setPaymentTotal} totalOrder={totalValue} />

            <Flex $direction="row" $gap="2rem">
              <Tabela onTotalChange={setTotalValue} />
              <Flex $direction="column" $gap="20px" $justify="center">
                <StyledParagraph>
                  Valor total de pagamento:{' '}
                  {paymentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </StyledParagraph>
                <StyledParagraph>
                  Valor total do pedido:{' '}
                  {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
}
