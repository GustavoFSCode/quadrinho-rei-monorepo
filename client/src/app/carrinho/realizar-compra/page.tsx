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
import { unformatCurrency } from '@/utils/masks';

import { useAuth } from '@/hooks/useAuth';
import { getUser, Address } from '@/services/clientService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  createOrUpdatePurchase,
  insertCoupon,
  insertCards,
  insertAddresses,
  finalizePurchase
} from '@/services/checkoutService';

export default function RealizarCompra() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);

  const [showModalEndereco, setShowModalEndereco] = useState(false);
  const [showModalCartao, setShowModalCartao] = useState(false);

  // Estados para validação
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<string | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [cardValues, setCardValues] = useState<Record<number, string>>({});
  
  // Constante do frete
  const FRETE_VALOR = 20.00;

  // Mutations para finalizar compra
  const finalizePurchaseMutation = useMutation({
    mutationFn: finalizePurchase,
    onSuccess: (response) => {
      toast.success(response.message || 'Compra finalizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['purchase'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Redirecionar para minhas-compras após sucesso
      setTimeout(() => {
        router.push('/minhas-compras');
      }, 2000); // 2 segundos para mostrar o toast de sucesso
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao finalizar compra');
    },
  });

  const createPurchaseMutation = useMutation({
    mutationFn: createOrUpdatePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar compra');
    },
  });

  // Carrega os dados do usuário e extrai endereços
  useEffect(() => {
    if (!user.documentId) return;
    (async () => {
      try {
        const fullUser = await getUser(user.documentId);
        setAddresses(fullUser.client.addresses);
        // Compra só será criada quando finalizar, não ao carregar a página
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
      }
    })();
  }, [user.documentId]);

  // Efeito para calcular o total com frete automaticamente
  useEffect(() => {
    const novoTotal = selectedDeliveryAddress ? cartSubtotal + FRETE_VALOR : cartSubtotal;
    setTotalValue(novoTotal);
  }, [cartSubtotal, selectedDeliveryAddress, FRETE_VALOR]);

  const handleFinalizarCompra = async () => {
    // Validações
    if (totalValue <= 0) {
      toast.error('Carrinho vazio');
      return;
    }

    if (!selectedDeliveryAddress) {
      toast.error('Selecione um endereço de entrega');
      return;
    }

    if (!selectedBillingAddress) {
      toast.error('Selecione um endereço de cobrança');
      return;
    }

    if (selectedCards.length === 0) {
      toast.error('Selecione pelo menos um cartão para pagamento');
      return;
    }

    // Usar comparação com tolerância para problemas de precisão decimal
    const tolerance = 0.01; // 1 centavo de tolerância
    if (Math.abs(paymentTotal - totalValue) > tolerance) {
      toast.error(`O valor do pagamento (${paymentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) deve ser igual ao valor total do pedido (${totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`);
      return;
    }

    // Verificar se todos os cartões selecionados têm valores
    for (const cardId of selectedCards) {
      const value = unformatCurrency(cardValues[cardId] || '0');
      if (value <= 0) {
        toast.error('Todos os cartões selecionados devem ter um valor válido');
        return;
      }
    }

    try {
      // Criar a compra antes de finalizar
      await createPurchaseMutation.mutateAsync();
      
      // Aqui você pode implementar as chamadas para insertAddresses e insertCards
      // Por enquanto, vou assumir que o backend já associa automaticamente
      
      finalizePurchaseMutation.mutate();
    } catch (error) {
      toast.error('Erro ao preparar compra');
    }
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
            <EnderecoEntregaList 
              addresses={entrega} 
              onSelectionChange={setSelectedDeliveryAddress}
            />

            <SubSectionTitle>Endereço de cobrança</SubSectionTitle>
            <EnderecoCobrancaList 
              addresses={cobranca}
              onSelectionChange={setSelectedBillingAddress}
            />

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
            <CartaoList 
              onTotalChange={(total) => {
                console.log('Payment total from cards:', total);
                setPaymentTotal(total);
              }} 
              totalOrder={totalValue}
              onSelectionChange={(cards, values) => {
                setSelectedCards(cards);
                setCardValues(values);
              }}
            />

            <Flex $direction="row" $gap="2rem">
              <Tabela onTotalChange={(value) => {
                console.log('Cart subtotal from table:', value);
                setCartSubtotal(value);
              }} />
              <Flex $direction="column" $gap="20px" $justify="center">
                <StyledParagraph>
                  Subtotal do carrinho:{' '}
                  {cartSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </StyledParagraph>
                <StyledParagraph>
                  Frete:{' '}
                  {selectedDeliveryAddress 
                    ? FRETE_VALOR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'R$ 0,00'}
                </StyledParagraph>
                <StyledParagraph>
                  <strong>
                    Valor total do pedido:{' '}
                    {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </StyledParagraph>
                <StyledParagraph>
                  Valor total de pagamento:{' '}
                  {paymentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </StyledParagraph>
                <Button
                  text={finalizePurchaseMutation.isPending ? "Finalizando..." : "Finalizar compra"}
                  type="button"
                  variant="purple"
                  onClick={handleFinalizarCompra}
                  disabled={Math.abs(paymentTotal - totalValue) > 0.01 || finalizePurchaseMutation.isPending}
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
