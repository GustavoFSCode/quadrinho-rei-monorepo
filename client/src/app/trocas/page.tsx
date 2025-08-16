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
import PaginationLink from '@/components/PaginationLink';

export default function Trocas() {
  const [isExpanded, setIsExpanded] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

    const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
          <Tabela 
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onTotalChange={setTotalItems}
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
    </>
  );
}
