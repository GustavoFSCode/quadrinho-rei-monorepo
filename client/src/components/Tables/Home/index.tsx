import React, { useEffect, useState } from 'react';
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
import { createOrder } from '@/services/cartService';

interface TabelaProps {
  products: Product[];
  onView: (product: Product) => void;
}

const Tabela: React.FC<TabelaProps> = ({ products, onView }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setQuantities(prev => {
      const next = { ...prev };
      products.forEach(p => {
        if (next[p.documentId] == null) next[p.documentId] = 1;
      });
      const ids = new Set(products.map(p => p.documentId));
      Object.keys(next).forEach(id => {
        if (!ids.has(id)) delete next[id];
      });
      return next;
    });
  }, [products]);

  const handleQuantityChange = (id: string, newQty: number) => {
    setQuantities(prev => ({ ...prev, [id]: newQty }));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      if (product.stock <= 0) {
        toast.warn('Produto sem estoque.');
        return;
      }
      const desired = quantities[product.documentId] ?? 1;
      const qty = Math.max(1, Math.min(desired, product.stock));
      setAdding(prev => ({ ...prev, [product.documentId]: true }));
      const res = await createOrder({ product: product.documentId, quantity: qty });
      toast.success(res?.message || 'Produto adicionado ao carrinho!');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Não foi possível adicionar ao carrinho.';
      toast.error(msg);
    } finally {
      setAdding(prev => ({ ...prev, [product.documentId]: false }));
    }
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
          {products.map(product => {
            const qty = quantities[product.documentId] ?? 1;
            const isAdding = !!adding[product.documentId];
            const disabled = isAdding || product.stock <= 0 || qty <= 0;
            return (
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
                  <button
                    onClick={() => onView(product)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    aria-label="Visualizar"
                    title="Visualizar"
                  >
                    <Eye />
                  </button>

                  <InputNumber
                    value={qty}
                    setValue={val => handleQuantityChange(product.documentId, val)}
                    max={product.stock}
                  />

                  <button
                    onClick={() => handleAddToCart(product)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.6 : 1,
                    }}
                    aria-label="Adicionar ao carrinho"
                    title={disabled ? 'Indisponível' : 'Adicionar ao carrinho'}
                    disabled={disabled}
                  >
                    <FiShoppingCart />
                  </button>
                </ActionCell>
              </TableRow>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default Tabela;
