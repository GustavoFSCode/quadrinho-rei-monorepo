'use client';

import { useState, useEffect } from 'react';
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
import Plus from '@/components/icons/Plus';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Estoque';
import FilterModal from '@/components/Modals/Clientes/Filter';
import { getClient } from '@/services/clientService';
import { Client } from '@/services/clientService';
import PaginationLink from '@/components/Pagination';
import ComicFormModal, {
  IComicForm,
} from '@/components/Modals/Estoque/CadastrarQuadrinho';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Estoque() {
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
      const response = await getClient(
        undefined,
        currentPage,
        itemsPerPage,
        debouncedFilter,
      );
      const clientsArray = Array.isArray(response)
        ? response
        : response.data ?? [];
      setClients(clientsArray);
      const total =
        response.totalCount !== undefined
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

  // Função para tratar a submissão do quadrinho
  const handleComicSubmit = (data: IComicForm) => {
    console.log('Dados do quadrinho:', data);
    // Aqui você pode realizar ações, como enviar os dados para uma API
    // Após o sucesso, fecha o modal e exibe o toast
    setIsModalOpen(false);
    toast.success('Quadrinho cadastrado com sucesso!');
  };

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Estoque</HeaderTitle>
          </HeaderTop>
          <HeaderBottom>
            <SearchAndActionsBox>
              <ButtonBox>
                <Button
                  text={
                    <>
                      <Plus />
                      Cadastrar quadrinho
                    </>
                  }
                  type="button"
                  variant="purple"
                  width="215px"
                  height="39px"
                  onClick={handleOpenModal}
                />
              </ButtonBox>
            </SearchAndActionsBox>
          </HeaderBottom>
        </Header>
        <Content>
          <Tabela />
        </Content>
        <Footer>
          <PaginationLink itemsPerPage={itemsPerPage} />
        </Footer>
      </ContentContainer>

      {isModalOpen && (
        <ComicFormModal
          onClose={handleCloseModal}
          onComicSubmit={handleComicSubmit}
        />
      )}

      {isFilterModalOpen && <FilterModal onClose={handleCloseFilterModal} />}

      {/* ToastContainer para exibir os toasts */}
      <ToastContainer />
    </>
  );
}
