"use client";

import React, { useState } from 'react';
import {
  ContentContainer,
  Header,
  HeaderTop,
  HeaderBottom,
  HeaderTitle,
  SearchAndActionsBox,
  ButtonBox,
  Content,
  Footer,
  ValueText
} from './styled';
import Button from "@/components/Button";
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Carrinho';
import PaginationLink from '@/components/PaginationLink';
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import { removeAllOrders, createOrUpdatePurchase } from '@/services/cartService';

const Carrinho: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [totalValue, setTotalValue] = useState<number>(0);

  // paginação do carrinho
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 12;

  // gatilho para forçar o reload da tabela após esvaziar carrinho
  const [reloadSignal, setReloadSignal] = useState<number>(0);

  // loading do botão "Realizar compra"
  const [creatingPurchase, setCreatingPurchase] = useState<boolean>(false);

  const router = useRouter();

  // Esvazia o carrinho no backend e força recarregar a tabela
  const handleEmptyCart = async (): Promise<void> => {
    try {
      await removeAllOrders();
      toast.success("Carrinho esvaziado com sucesso!");
      setTotalValue(0);
      setCurrentPage(1);
      setReloadSignal(s => s + 1); // força refetch na Tabela
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Não foi possível esvaziar o carrinho.";
      toast.error(msg);
    }
  };

  // Inicia a compra: chama o endpoint e redireciona para a próxima página
  const handleCheckout = async (): Promise<void> => {
    if (totalValue <= 0) {
      toast.warn("Seu carrinho está vazio.");
      return;
    }
    try {
      setCreatingPurchase(true);
      // Chamada ao backend para criar/atualizar a compra (payload opcional, se necessário)
      await createOrUpdatePurchase();
      router.push("/carrinho/realizar-compra");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Não foi possível iniciar a compra.";
      toast.error(msg);
    } finally {
      setCreatingPurchase(false);
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Carrinho</HeaderTitle>
          </HeaderTop>
          <HeaderBottom>
            <SearchAndActionsBox>
              <ValueText>
                Valor total:{" "}
                {totalValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </ValueText>
              <ButtonBox>
                <Button
                  text={<>Esvaziar carrinho</>}
                  type="button"
                  variant="red"
                  width="185px"
                  height="39px"
                  onClick={handleEmptyCart}
                />
                <Button
                  // desabilita enquanto processa ou se carrinho estiver vazio
                  disabled={creatingPurchase || totalValue <= 0}
                  text={<>{creatingPurchase ? "Processando..." : "Realizar compra"}</>}
                  type="button"
                  variant="purple"
                  width="195px"
                  height="39px"
                  onClick={handleCheckout}
                />
              </ButtonBox>
            </SearchAndActionsBox>
          </HeaderBottom>
        </Header>

        <Content>
          {/* A Tabela faz o fetch dos pedidos e reporta total/paginação ao pai */}
          <Tabela
            page={currentPage}
            pageSize={itemsPerPage}
            reloadSignal={reloadSignal}
            onTotalChange={setTotalValue}
            onPaginationChange={({ totalOrders }) => setTotalItems(totalOrders)}
          />
        </Content>

        <Footer>
          <PaginationLink
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </Footer>
      </ContentContainer>

      <ToastContainer />
    </>
  );
};

export default Carrinho;
