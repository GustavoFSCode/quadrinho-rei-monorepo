// components/PaginationLink/index.tsx

import React from 'react';
import ReactPaginate from 'react-paginate';
import LeftArrow from '../icons/LeftArrow';
import RightArrow from '../icons/RightArrow';
import { PaginationWrapper, PaginationFooter, PaginationText, PageArrow } from './styled';

interface PaginationLinkProps {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

const PaginationLink: React.FC<PaginationLinkProps> = ({ itemsPerPage, currentPage, totalItems, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePageChange = (selectedItem: { selected: number }) => {
        const newPage = selectedItem.selected + 1; // O react-paginate começa em zero
        onPageChange(newPage);
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
                    pageClassName={'page-item'}
                    forcePage={currentPage - 1}
                />
            </PaginationWrapper>
        </PaginationFooter>
    );
}

export default PaginationLink;
