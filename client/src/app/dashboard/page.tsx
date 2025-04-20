'use client';

import { useState } from 'react';
import {
  ContentContainer,
  Header,
  HeaderTop,
  HeaderTitle,
  Content,
} from './styled';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Dashboard';

export default function Dashboard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Dashboard</HeaderTitle>
          </HeaderTop>
        </Header>
        <Content>
          <Tabela />
        </Content>
      </ContentContainer>
    </>
  );
}
