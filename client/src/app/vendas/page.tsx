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
  ButtonBox,
  Content,
  Footer
} from './styled';
import Plus from '@/components/icons/Plus';
import Button from "@/components/Button";
import Input from '@/components/Inputs/Input/Input';
import Navbar from '@/components/Navbar';
import Barra from '@/components/icons/Barra';
import Tabela from '@/components/Tables/Clientes';
import ModalCadastrarClientes from '@/components/Modals/Clientes/CadastrarCliente';
import FilterModal from '@/components/Modals/Clientes/Filter';
import { getClient } from '@/services/clientService';
import { Client } from '@/services/clientService';
import PaginationLink from '@/components/PaginationLink';

export default function Vendas() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState(filter);

  // Debounce para evitar chamar a API a cada tecla
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
      setCurrentPage(1); // Reseta a página ao aplicar um novo filtro
    }, 300);

    return () => clearTimeout(handler);
  }, [filter]);

  const fetchClients = async () => {
    try {
      const response = await getClient(undefined, currentPage, itemsPerPage, debouncedFilter);

      // Verifica se a resposta já é um array ou se está encapsulada no objeto (com propriedade "data")
      const clientsArray = Array.isArray(response)
        ? response
        : response.data ?? [];

      setClients(clientsArray);

      // Se houver totalCount na resposta, usa-o; caso contrário, usa o tamanho do array
      const total = response.totalCount !== undefined
        ? response.totalCount
        : clientsArray.length;
      setTotalItems(total);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setClients([]);
      setTotalItems(0);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage, debouncedFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleCloseFilterModal = () => setIsFilterModalOpen(false);

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
              <ButtonBox>

              </ButtonBox>
            </SearchAndActionsBox>
          </HeaderBottom>
        </Header>
        <Content>
          <Tabela
            clients={clients}
            onClientDeleted={fetchClients}
            onUserToggled={fetchClients}
            onClientEdited={fetchClients}
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

      {isModalOpen && (
        <ModalCadastrarClientes onClose={handleCloseModal} onClientCreated={fetchClients} />
      )}

      {isFilterModalOpen && <FilterModal onClose={handleCloseFilterModal} />}
    </>
  );
}
