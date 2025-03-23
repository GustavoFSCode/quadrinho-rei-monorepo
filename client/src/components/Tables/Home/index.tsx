import React, { useState } from 'react';
import {
  TableContainer,
  Table,
  TableHeadCell,
  TableHeadAction,
  TableBodyCell,
  TableRow,
  ActionCell
} from './styled';
import ToggleButton from '@/components/Button/ToggleFake';
import InputNumber from '@/components/Inputs/InputNumber/InputNumber';
import Eye from '@/components/icons/Eye';
import { FiShoppingCart } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Tabela() {
  // Dados fake de quadrinhos
  const comics = [
    { id: 1, title: "Homem-Aranha: N°1", price: 25.0, stock: 10 },
    { id: 2, title: "Homem-Aranha: N°2", price: 25.0, stock: 10 },
    { id: 3, title: "Homem-Aranha: N°3", price: 25.0, stock: 10 },
    { id: 4, title: "Homem-Aranha: N°4", price: 25.0, stock: 10 },
    { id: 5, title: "Homem-Aranha: N°5", price: 25.0, stock: 10 },
    { id: 6, title: "Homem-Aranha: N°6", price: 25.0, stock: 10 },
    { id: 7, title: "Homem-Aranha: N°7", price: 25.0, stock: 10 },
    { id: 8, title: "Homem-Aranha: N°8", price: 25.0, stock: 10 },
    { id: 9, title: "Homem-Aranha: N°9", price: 25.0, stock: 10 },
    { id: 10, title: "Homem-Aranha: N°10", price: 25.5, stock: 10 },
    { id: 11, title: "Batman: Noite Sombria", price: 30.0, stock: 25 },
    { id: 12, title: "Superman: O Último Herói", price: 20.0, stock: 15 },
  ];

  // Estado para controlar a quantidade selecionada para cada quadrinho (inicia com 1)
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    comics.forEach(comic => {
      initial[comic.id] = 1;
    });
    return initial;
  });

  const handleQuantityChange = (id: number, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: newQuantity,
    }));
  };

  const handleAddToCart = () => {
    toast.success("Produto adicionado ao carrinho!");
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
            {comics.map((comic) => (
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
                  <Eye />
                  <InputNumber
                    value={quantities[comic.id]}
                    setValue={(value) => handleQuantityChange(comic.id, value)}
                    max={comic.stock}
                  />
                  <button
                    onClick={handleAddToCart}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <FiShoppingCart />
                  </button>
                </ActionCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <ToastContainer />
    </>
  );
}

export default Tabela;
