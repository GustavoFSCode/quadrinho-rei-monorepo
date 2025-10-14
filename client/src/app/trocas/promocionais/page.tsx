'use client';

import { useState } from 'react';
import {
  ContentContainer,
  Header,
  HeaderTop,
  HeaderTitle,
  HeaderBottom,
  SearchAndActionsBox,
  Content,
  Footer,
} from './styled';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Cupons-Promocionais';
import PaginationLink from '@/components/PaginationLink';
import Button from '@/components/Button';
import ModalCriarCupom from '@/components/Modals/Cupons/CriarCupom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CuponsPromocionais() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModalCriarCupom, setShowModalCriarCupom] = useState(false);
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
            <HeaderTitle>Cupons promocionais</HeaderTitle>
            <Button
              text="Gerar cupons"
              type="button"
              variant="purple"
              width="160px"
              height="39px"
              onClick={() => setShowModalCriarCupom(true)}
            />
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

      {showModalCriarCupom && (
        <ModalCriarCupom onClose={() => setShowModalCriarCupom(false)} />
      )}

      <ToastContainer />
    </>
  );
}
