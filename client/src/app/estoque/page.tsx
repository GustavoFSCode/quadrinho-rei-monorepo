// src/app/Estoque/page.tsx
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
import PaginationLink from '@/components/PaginationLink';
import ComicFormModal, { IComicForm } from '@/components/Modals/Estoque/CadastrarQuadrinho';
import ModalDescartation from '@/components/Modals/Estoque/Descartation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  getProductsMaster,
  createProduct,
  editProduct,
  Product,
} from '@/services/productService';

export default function Estoque() {
  const [isExpanded, setIsExpanded] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Valores iniciais para o formulário de criação
  const emptyForm: IComicForm = {
    title: '',
    author: '',
    publisher: '',
    year: new Date().getFullYear(),
    issue: '',
    edition: '',
    pages: 1,
    synopsis: '',
    category: [],
    isbn: '',
    pricingGroup: '',
    barcode: '',
    dimensions: { height: 0, width: 0, weight: 0, depth: 0 },
    price: 0,
    stock: 0,
    active: true,
    inactivationReason: '',
  };

  // Busca produtos da API
  const fetchProducts = async () => {
    try {
      const data = await getProductsMaster(currentPage, itemsPerPage);
      setProducts(data);
      setTotalItems(data.length);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
      setTotalItems(0);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenCreate = () => {
    setActiveProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setActiveProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveProduct(null);
  };

  // Mapeia do formulário para o payload da API
  const mapFormToPayload = (form: IComicForm) => ({
    title: form.title,
    author: form.author,
    publisher: form.publisher,
    year: String(form.year),
    issue: form.issue,
    edition: form.edition ?? '',
    pageNumber: form.pages,
    synopsis: form.synopsis,
    isbn: form.isbn,
    barCode: form.barcode,
    height: form.dimensions.height,
    length: form.dimensions.width,
    weight: form.dimensions.weight,
    depth: form.dimensions.depth,
    priceBuy: form.price,
    priceSell: form.price,
    stock: form.stock,
    active: form.active,
    inactiveReason: form.inactivationReason ?? null,
    precificationType: form.pricingGroup,
    productCategories: form.category,
  });

  const handleSubmitForm = async (form: IComicForm) => {
    try {
      if (activeProduct) {
        await editProduct(activeProduct.documentId, mapFormToPayload(form));
        toast.success('Produto editado com sucesso!');
      } else {
        await createProduct(mapFormToPayload(form));
        toast.success('Quadrinho cadastrado com sucesso!');
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto. Tente novamente.');
    }
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
                      <Plus /> Cadastrar quadrinho
                    </>
                  }
                  type="button"
                  variant="purple"
                  width="215px"
                  height="39px"
                  onClick={handleOpenCreate}
                />
              </ButtonBox>
            </SearchAndActionsBox>
          </HeaderBottom>
        </Header>
        <Content>
          <Tabela
            products={products}
            onEdit={handleOpenEdit}
            onDelete={(p) => setProductToDelete(p)}
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
        <ComicFormModal
          onClose={handleCloseModal}
          onComicSubmit={handleSubmitForm}
          initialData={
            activeProduct
              ? {
                  title: activeProduct.title,
                  author: activeProduct.author,
                  publisher: activeProduct.publisher,
                  year: Number(activeProduct.year),
                  issue: activeProduct.issue,
                  edition: activeProduct.edition,
                  pages: activeProduct.pageNumber,
                  synopsis: activeProduct.synopsis,
                  category: activeProduct.productCategories,
                  isbn: activeProduct.isbn,
                  pricingGroup: activeProduct.precificationType,
                  barcode: activeProduct.barCode,
                  dimensions: {
                    height: activeProduct.height,
                    width: activeProduct.length,
                    weight: activeProduct.weight,
                    depth: activeProduct.depth,
                  },
                  price: activeProduct.priceSell,
                  stock: activeProduct.stock,
                  active: activeProduct.active,
                  inactivationReason: activeProduct.inactiveReason ?? '',
                }
              : emptyForm
          }
        />
      )}

      {productToDelete && (
        <ModalDescartation
          userDocumentId={productToDelete.documentId}
          onClose={() => setProductToDelete(null)}
          onDeleted={fetchProducts}
        />
      )}

      <ToastContainer />
    </>
  );
}
