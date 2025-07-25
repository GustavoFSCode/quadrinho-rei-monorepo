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
import { FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Product } from '@/services/productService';

interface TabelaProps {
  products: Product[];
  onView: (product: Product) => void;
}

const Tabela: React.FC<TabelaProps> = ({ products, onView }) => {
  // Quantidades por produto (para carrinho)
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      products.forEach(p => {
        initial[p.documentId] = 1;
      });
      return initial;
    }
  );

  // Atualiza quantidade
  const handleQuantityChange = (id: string, newQty: number) => {
    setQuantities(prev => ({ ...prev, [id]: newQty }));
  };

  // Adiciona ao carrinho
  const handleAddToCart = (product: Product) => {
    // aqui você pode usar product e quantities[product.documentId]
    toast.success('Produto adicionado ao carrinho!');
  };

  return (
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
          {products.map(product => (
            <TableRow key={product.documentId}>
              <TableBodyCell>{product.title}</TableBodyCell>
              <TableBodyCell>
                {product.priceSell.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </TableBodyCell>
              <TableBodyCell>{product.stock}</TableBodyCell>
              <ActionCell>
                {/* visualização */}
                <button
                  onClick={() => onView(product)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Eye />
                </button>

                {/* quantidade */}
                <InputNumber
                  value={quantities[product.documentId] ?? 1}
                  setValue={val => handleQuantityChange(product.documentId, val)}
                  max={product.stock}
                />

                {/* carrinho */}
                <button
                  onClick={() => handleAddToCart(product)}
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
  );
};

export default Tabela;
