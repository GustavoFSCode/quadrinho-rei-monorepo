'use client';

import { useState, useEffect } from 'react';
import {
  ContentContainer,
  Header,
  HeaderTop,
  HeaderTitle,
  Content,
  Footer,
} from './styled';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Trocas';
import PaginationLink from '@/components/Pagination';

export default function Trocas() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemsPerPage] = useState(12);

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Trocas</HeaderTitle>
          </HeaderTop>
        </Header>
        <Content>
          <Tabela />
        </Content>
        <Footer>
          <PaginationLink itemsPerPage={itemsPerPage} />
        </Footer>
      </ContentContainer>
    </>
  );
}
