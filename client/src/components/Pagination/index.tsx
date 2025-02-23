// PaginationLink/index.tsx
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ReactPaginate from 'react-paginate';
import LeftArrow from '../icons/LeftArrow';
import RightArrow from '../icons/RightArrow';
import { PaginationWrapper, PaginationFooter, PaginationText, PageArrow } from './styled';

interface PaginationLinkProps {
  itemsPerPage: number;
}

const PaginationLink: React.FC<PaginationLinkProps> = ({ itemsPerPage }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    setCurrentPage(parseInt(pageParam || '1', 10)); // Garantir que seja uma string
  }, [searchParams]);

  const totalItems = 195; // Você pode considerar tornar isso dinâmico no futuro
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (selectedItem: { selected: number }) => {
    const newPage = selectedItem.selected + 1; // react-paginate é baseado em zero
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage.toString());
    window.history.pushState({}, '', url.toString());
    setCurrentPage(newPage); // Atualiza o estado local
  };

  return (
    <PaginationFooter>
      <PaginationText>
        Mostrando {startItem} a {endItem} de {totalItems}
      </PaginationText>
      <PaginationWrapper>
        <ReactPaginate
          previousLabel={<PageArrow><LeftArrow /></PageArrow>}
          nextLabel={<PageArrow><RightArrow /></PageArrow>}
          breakLabel={'...'}
          pageCount={totalPages}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
          disabledClassName={'disabled'}
          pageClassName={'page-item'} // Adiciona a classe aos itens de página
          forcePage={currentPage - 1}
        />
      </PaginationWrapper>
    </PaginationFooter>
  );
}

export default PaginationLink;
