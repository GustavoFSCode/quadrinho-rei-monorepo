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
import Pagination from '@/components/Pagination';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Carrinho: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [totalValue, setTotalValue] = useState<number>(0);

  const handleEmptyCart = (): void => {
    toast.success("Carrinho esvaziado com sucesso!");
  };

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
                  text={<>Realizar compra</>}
                  type="button"
                  variant="purple"
                  width="195px"
                  height="39px"
                  onClick={handleEmptyCart}
                />
              </ButtonBox>
            </SearchAndActionsBox>
          </HeaderBottom>
        </Header>
        <Content>
          <Tabela onTotalChange={setTotalValue} />
        </Content>
        <Footer>
          <Pagination itemsPerPage={12} />
        </Footer>
      </ContentContainer>
      <ToastContainer />
    </>
  );
};

export default Carrinho;
