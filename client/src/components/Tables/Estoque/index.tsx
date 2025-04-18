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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pencil from '@/components/icons/Pencil';
import Trash from '@/components/icons/Trash';
import ModalDescartation from '@/components/Modals/Estoque/Descartation';
import ModalEditarQuadrinho from '@/components/Modals/Estoque/EditarQuadrinho';

interface Comic {
  id: number;
  title: string;
  price: number;
  stock: number;
}

function Tabela() {
  // Dados fake de quadrinhos
  const comics = [
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

  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);

  const handleOpenModal = (comic: Comic) => {
    setSelectedComic(comic);
  };

  // Callback passado para o modal para fechar o modal
  const handleModalClose = (shouldCloseAll: boolean) => {
    // Se necessário, com base no valor de shouldCloseAll você pode executar lógicas extras
    setSelectedComic(null);
  };

  // Callback para quando o produto for "removido"
  const handleDeletion = () => {
    // Aqui você pode incluir a lógica de remoção do quadrinho do carrinho
    toast.success('Produto excluído com sucesso!');
    setSelectedComic(null);
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
                  <Trash onClick={() => handleOpenModal(comic)} />
                  <Pencil />
                </ActionCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <ToastContainer />
      {selectedComic && (
        <ModalDescartation
          onClose={handleModalClose}
          userDocumentId={selectedComic.id.toString()}
          onDeleted={handleDeletion}
        />
      )}
    </>
  );
}

export default Tabela;
