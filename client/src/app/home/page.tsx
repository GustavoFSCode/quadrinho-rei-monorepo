"use client";

import { useState, useEffect } from 'react';
import {
  ContentContainer,
  Header,
  HeaderTop,
  HeaderBottom,
  HeaderTitle,
  SearchAndActionsBox,
  StyledInputBox,
  Content,
  Footer
} from './styled';
import Input from '@/components/Inputs/Input/Input';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Home';
import Pagination from '@/components/Pagination';

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Home</HeaderTitle>
          </HeaderTop>
          <HeaderBottom>
            <SearchAndActionsBox>
              <StyledInputBox>
                <Input
                  id="search"
                  label=""
                  placeholder="Busque um quadrinho por qualquer informação..."
                  width="351px"
                  onChange={(e) => (e.target.value)}
                />
              </StyledInputBox>
            </SearchAndActionsBox>
          </HeaderBottom>
        </Header>
         <Content>
           <Tabela />
          </Content>
        <Footer>
           <Pagination itemsPerPage={12} />
        </Footer>
      </ContentContainer>
    </>
  );
}
