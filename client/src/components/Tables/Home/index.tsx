'use client';
import React, { useState } from 'react';
import {
  TableContainer,
  Table,
  TableHeadCell,
  TableHeadAction,
  TableBodyCell,
  TableRow,
  ActionCell,
} from './styled';
import InputNumber from '@/components/Inputs/InputNumber/InputNumber';
import Eye from '@/components/icons/Eye';
import ModalEditarQuadrinho, {
  IComicForm,
} from '@/components/Modals/Estoque/EditarQuadrinho';
import { FiShoppingCart } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ComicSummary {
  id: number;
  title: string;
  price: number;
  stock: number;
}

const fakeEditComicData = (_comic: ComicSummary): IComicForm => ({
  title: 'Batman: O Longo Dia das Bruxas',
  author: 'Jeph Loeb',
  publisher: 'DC Comics Brasil',
  year: 1996,
  issue: '1',
  edition: '1ª Edição',
  pages: 224,
  synopsis:
    'Na noite de Halloween, um misterioso assassino começa a eliminar membros da máfia de Gotham, e Batman precisa desvendar essa trama sombria antes que mais vítimas caiam.',
  category: ['superhero', 'aventura'],
  isbn: '9781401207574',
  pricingGroup: 'premium',
  barcode: '7891119075745',
  dimensions: {
    height: 26,
    width: 17,
    weight: 2.5,
    depth: 8,
  },
  price: 90,
  stock: 10,
  active: true,
  inactivationReason: '',
});

function Tabela() {
  const comics: ComicSummary[] = [
    { id: 1, title: 'Homem-Aranha: N°1', price: 25.0, stock: 10 },
    { id: 2, title: 'Homem-Aranha: N°2', price: 25.0, stock: 10 },
    { id: 3, title: 'Homem-Aranha: N°3', price: 25.0, stock: 10 },
    { id: 4, title: 'Homem-Aranha: N°4', price: 25.0, stock: 10 },
    { id: 5, title: 'Homem-Aranha: N°5', price: 25.0, stock: 10 },
    { id: 6, title: 'Homem-Aranha: N°6', price: 25.0, stock: 10 },
    { id: 7, title: 'Homem-Aranha: N°7', price: 25.0, stock: 10 },
    { id: 8, title: 'Homem-Aranha: N°8', price: 25.0, stock: 10 },
    { id: 9, title: 'Homem-Aranha: N°9', price: 25.0, stock: 10 },
    { id: 10, title: 'Homem-Aranha: N°10', price: 25.5, stock: 10 },
    { id: 11, title: 'Batman: Noite Sombria', price: 30.0, stock: 25 },
    { id: 12, title: 'Superman: O Último Herói', price: 20.0, stock: 15 },
  ];

  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    comics.forEach(c => {
      initial[c.id] = 1;
    });
    return initial;
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<IComicForm | null>(null);
  const [modalReadonly, setModalReadonly] = useState(false);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    setQuantities(prev => ({ ...prev, [id]: newQuantity }));
  };

  const handleAddToCart = () => {
    toast.success('Produto adicionado ao carrinho!');
  };

  const handleEyeClick = (comic: ComicSummary) => {
    setModalData(fakeEditComicData(comic));
    setModalReadonly(true);
    setShowModal(true);
  };

  const handleComicSubmit = (data: IComicForm) => {
    toast.success('Produto editado com sucesso!');
    setShowModal(false);
  };

  return (
    <>
      <TableContainer>
        <Table aria-label="Tabela de Quadrinhos">
          <thead>
            <tr>
              <TableHeadCell>Título</TableHeadCell>
              <TableHeadCell>Preço</TableHeadCell>
              <TableHeadCell>Estoque</TableHeadCell>
              <TableHeadAction>Ações</TableHeadAction>
            </tr>
          </thead>
          <tbody>
            {comics.map(comic => (
              <TableRow key={comic.id}>
                <TableBodyCell>{comic.title}</TableBodyCell>
                <TableBodyCell>
                  {comic.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableBodyCell>
                <TableBodyCell>{comic.stock}</TableBodyCell>
                <ActionCell>
                  <button
                    onClick={() => handleEyeClick(comic)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Eye />
                  </button>
                  <InputNumber
                    value={quantities[comic.id]}
                    setValue={value => handleQuantityChange(comic.id, value)}
                    max={comic.stock}
                  />
                  <button
                    onClick={handleAddToCart}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <FiShoppingCart />
                  </button>
                </ActionCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {showModal && modalData && (
        <ModalEditarQuadrinho
          initialData={modalData}
          readonly={modalReadonly}
          onClose={() => setShowModal(false)}
          onComicSubmit={handleComicSubmit}
        />
      )}
      <ToastContainer />
    </>
  );
}

export default Tabela;
