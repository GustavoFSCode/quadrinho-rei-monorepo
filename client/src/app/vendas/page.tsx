'use client';

import { useState } from 'react';
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
} from './styled';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Vendas';
import PaginationLink from '@/components/Pagination';

export default function Vendas() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemsPerPage] = useState(12);

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Vendas</HeaderTitle>
          </HeaderTop>
          <HeaderBottom>
            <SearchAndActionsBox>
              <ButtonBox></ButtonBox>
            </SearchAndActionsBox>
          </HeaderBottom>
        </Header>
        <Content>
          <Tabela />
        </Content>
      </ContentContainer>
    </>
  );
}
