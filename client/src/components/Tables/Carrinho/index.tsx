import React, { useEffect, useMemo, useState } from 'react';
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
import { toast } from "react-toastify";
import { CartOrder } from '@/services/cartService';
import { useCartOrders, useUpdateQuantityOrderMutation, useRemoveOrderMutation } from '@/hooks/useCartQuery';

interface TabelaProps {
  page: number;
  pageSize: number;
  onTotalChange: (total: number) => void; // recebe número, não função
  onPaginationChange?: (meta: { totalOrders: number; totalPages: number }) => void;
}

const Tabela: React.FC<TabelaProps> = ({
  page,
  pageSize,
  onTotalChange,
  onPaginationChange
}) => {
  const { data, isLoading, error } = useCartOrders(page, pageSize);
  const updateQuantityMutation = useUpdateQuantityOrderMutation();
  const removeOrderMutation = useRemoveOrderMutation();

  // loading por item
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  // item selecionado para o modal
  const [selectedOrder, setSelectedOrder] = useState<CartOrder | null>(null);

  const orders = data?.orders || [];
  const totalValue = data?.totalValue || 0;

  // total local (usado como fallback)
  const localTotal = useMemo(
    () => orders.reduce((sum, o) => sum + (o.price * o.quantity), 0),
    [orders]
  );

  // Atualiza total e paginação quando dados mudam
  useEffect(() => {
    if (data) {
      onTotalChange(data.totalValue ?? localTotal);
      onPaginationChange?.({
        totalOrders: data.pagination.totalOrders,
        totalPages: data.pagination.totalPages
      });
    } else if (error) {
      onTotalChange(0);
      onPaginationChange?.({ totalOrders: 0, totalPages: 0 });
    }
  }, [data, localTotal, onTotalChange, onPaginationChange, error]);

  // abre/fecha modal de remoção
  const handleOpenModal = (order: CartOrder) => setSelectedOrder(order);
  const handleModalClose = () => setSelectedOrder(null);

  // Confirma remoção do item selecionado
  const handleDeletion = async () => {
    if (!selectedOrder) return;
    setSelectedOrder(null);
    removeOrderMutation.mutate(selectedOrder.documentId);
  };

  // Atualiza quantidade no backend
  const handleQuantityChange = async (order: CartOrder, newQuantity: number) => {
    // limita quantidade entre 1 e o estoque
    const qty = Math.max(1, Math.min(newQuantity, order.stock));
    if (qty === order.quantity) return;

    setUpdating(prev => ({ ...prev, [order.documentId]: true }));
    
    try {
      await updateQuantityMutation.mutateAsync({ 
        order: order.documentId, 
        quantity: qty 
      });
    } finally {
      setUpdating(prev => ({ ...prev, [order.documentId]: false }));
    }
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
            {!isLoading && orders.length === 0 && (
              <tr>
                <TableBodyCell colSpan={4}>Carrinho vazio</TableBodyCell>
              </tr>
            )}

            {orders.map(order => {
              const isUpdating = !!updating[order.documentId];
              const isDeleting = removeOrderMutation.isPending;

              return (
                <TableRow key={order.documentId}>
                  <TableBodyCell>{order.title}</TableBodyCell>

                  <TableBodyCell>
                    {order.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableBodyCell>

                  {/* estoque disponível informado pelo backend */}
                  <TableBodyCell>{order.stock}</TableBodyCell>

                  <ActionCell>
                    <InputNumber
                      value={order.quantity}
                      setValue={(value: number) => handleQuantityChange(order, value)}
                      max={order.stock}
                      disabled={isUpdating || isDeleting}
                    />

                    {/* lixeira abre modal de confirmação */}
                    <span
                      role="button"
                      aria-label="Remover do carrinho"
                      title="Remover do carrinho"
                      onClick={() => handleOpenModal(order)}
                      style={{
                        display: 'inline-flex',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        opacity: isDeleting ? 0.6 : 1,
                        marginLeft: 8
                      }}
                    >
                      <Trash />
                    </span>
                  </ActionCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>

      {/* Modal de confirmação de remoção */}
      {selectedOrder && (
        <ModalDescartation
          onClose={handleModalClose}
          userDocumentId={selectedOrder.documentId}
          onDeleted={handleDeletion}
        />
      )}
    </>
  );
};

export default Tabela;
