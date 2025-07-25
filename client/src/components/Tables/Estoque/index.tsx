import React from 'react';
import {
  TableContainer,
  Table,
  TableHeadCell,
  TableHeadAction,
  TableBodyCell,
  TableRow,
  ActionCell,
} from './styled';
import Pencil from '@/components/icons/Pencil';
import Trash from '@/components/icons/Trash';
import { Product } from '@/services/productService';

interface TabelaProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const Tabela: React.FC<TabelaProps> = ({ products, onEdit, onDelete }) => {
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
            <TableRow key={product.id}>
              <TableBodyCell>{product.title}</TableBodyCell>
              <TableBodyCell>
                {product.priceBuy.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </TableBodyCell>
              <TableBodyCell>{product.stock}</TableBodyCell>
              <ActionCell>
                <Trash onClick={() => onDelete(product)} />
                <Pencil onClick={() => onEdit(product)} />
              </ActionCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default Tabela;
