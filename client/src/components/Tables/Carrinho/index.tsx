import React, { useState, useEffect } from 'react';
import {
  TableContainer,
  Table,
  TableHeadCell,
  TableHeadAction,
  TableBodyCell,
  TableRow,
  ActionCell
} from './styled';
import InputNumber from '@/components/Inputs/InputNumber/InputNumber';
import ModalDescartation from '@/components/Modals/Carrinho/ExcluirProduto/Descartation';
import Trash from '@/components/icons/Trash';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Define a interface para os quadrinhos
interface Comic {
  id: number;
  title: string;
  price: number;
  stock: number;
}

// Define os tipos das props do componente
interface TabelaProps {
  onTotalChange: (total: number) => void;
}

const Tabela: React.FC<TabelaProps> = ({ onTotalChange }) => {
  // Estado para armazenar o quadrinho cujo modal será aberto
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);

  // Dados fake de quadrinhos
  const comics: Comic[] = [
    { id: 1, title: "Homem-Aranha: N°1", price: 25.0, stock: 10 },
    { id: 2, title: "Homem-Aranha: N°2", price: 25.0, stock: 10 },
    { id: 11, title: "Batman: Noite Sombria", price: 30.0, stock: 25 },
    { id: 12, title: "Superman: O Último Herói", price: 20.0, stock: 15 },
  ];

  // Estado para controlar a quantidade selecionada para cada quadrinho
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    comics.forEach((comic) => {
      // Inicia com 3 para Homem-Aranha: N°1 (id 1) e Batman: Noite Sombria (id 11); os demais iniciam com 1.
      initial[comic.id] = (comic.id === 1 || comic.id === 11) ? 3 : 1;
    });
    return initial;
  });

  // Sempre que as quantidades mudarem, recalcula o valor total do carrinho
  useEffect(() => {
    const total = comics.reduce(
      (acc, comic) => acc + comic.price * (quantities[comic.id] || 0),
      0
    );
    onTotalChange(total);
  }, [quantities, comics, onTotalChange]);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: newQuantity,
    }));
  };

  // Ao clicar no trash, salva o quadrinho selecionado
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
    toast.success("Produto removido do carrinho!");
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
                {/* Exibe o estoque restante */}
                <TableBodyCell>{comic.stock - (quantities[comic.id] || 0)}</TableBodyCell>
                <ActionCell>
                  <InputNumber
                    value={quantities[comic.id]}
                    setValue={(value: number) => handleQuantityChange(comic.id, value)}
                    max={comic.stock}
                  />
                  {/* Ao clicar na lixeira, abre o modal de descarte */}
                  <Trash onClick={() => handleOpenModal(comic)} />
                </ActionCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <ToastContainer />
      {/* Renderiza o modal se um quadrinho estiver selecionado */}
      {selectedComic && (
        <ModalDescartation
          onClose={handleModalClose}
          userDocumentId={selectedComic.id.toString()}
          onDeleted={handleDeletion}
        />
      )}
    </>
  );
};

export default Tabela;
