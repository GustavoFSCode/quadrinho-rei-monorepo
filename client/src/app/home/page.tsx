'use client';

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
  Footer,
} from './styled';
import Input from '@/components/Inputs/Input/Input';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Home';
import PaginationLink from '@/components/PaginationLink';
import ModalEditarQuadrinho, { IComicForm } from '@/components/Modals/Estoque/EditarQuadrinho';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  getProductsUser,
  Product,
} from '@/services/productService';

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // debounce do filtro
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [filter]);

  // busca sempre que página ou filtro alterarem
  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedFilter]);

  async function fetchProducts() {
    try {
      const res = await getProductsUser(currentPage, itemsPerPage, debouncedFilter);
      if (Array.isArray(res)) {
        setProducts(res);
        setTotalItems(res.length);
      } else {
        setProducts(res.data);
        setTotalItems(res.totalCount);
      }
    } catch (err) {
      console.error('Erro ao buscar quadrinhos:', err);
      setProducts([]);
      setTotalItems(0);
      toast.error('Falha ao carregar quadrinhos');
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleView = (product: Product) => {
    setModalProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalProduct(null);
  };

  // mapeia Product → IComicForm
  const mapProductToForm = (p: Product): IComicForm => ({
    title: p.title,
    author: p.author,
    publisher: p.publisher,
    year: Number(p.year),
    issue: p.issue,
    edition: p.edition,
    pages: p.pageNumber,
    synopsis: p.synopsis,
    category: p.productCategories.map(c => c.documentId),
    isbn: p.isbn,
    pricingGroup: p.precificationType.documentId,
    barcode: p.barCode,
    dimensions: {
      height: p.height,
      width: p.length,
      weight: p.weight,
      depth: p.depth,
    },
    price: p.priceSell,
    stock: p.stock,
    active: p.active,
    inactivationReason: p.inactiveReason ?? '',
  });

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
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
              </StyledInputBox>
            </SearchAndActionsBox>
          </HeaderBottom>
        </Header>

        <Content>
          <Tabela
            products={products}
            onView={handleView}
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

      {showModal && modalProduct && (
        <ModalEditarQuadrinho
          initialData={mapProductToForm(modalProduct)}
          readonly={true}
          onClose={handleCloseModal}
          onComicSubmit={() => handleCloseModal()}
        />
      )}

      <ToastContainer />
    </>
  );
}
