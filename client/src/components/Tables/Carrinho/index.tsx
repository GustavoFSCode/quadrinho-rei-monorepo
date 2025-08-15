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
import {
  CartOrder,
  getOrders,
  updateQuantityOrder,
  removeOrder,
  OrdersData
} from '@/services/cartService';

interface TabelaProps {
  page: number;
  pageSize: number;
  reloadSignal?: number;
  onTotalChange: (total: number) => void; // recebe número, não função
  onPaginationChange?: (meta: { totalOrders: number; totalPages: number }) => void;
}

const Tabela: React.FC<TabelaProps> = ({
  page,
  pageSize,
  reloadSignal = 0,
  onTotalChange,
  onPaginationChange
}) => {
  const [orders, setOrders] = useState<CartOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // loading por item
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  // item selecionado para o modal
  const [selectedOrder, setSelectedOrder] = useState<CartOrder | null>(null);

  // total local (usado como fallback)
  const localTotal = useMemo(
    () => orders.reduce((sum, o) => sum + (o.price * o.quantity), 0),
    [orders]
  );

  // Busca pedidos do carrinho (paginado)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data: OrdersData = await getOrders(page, pageSize);

      setOrders(data.orders);
      onTotalChange(data.totalValue ?? localTotal); // informa total ao pai
      onPaginationChange?.({
        totalOrders: data.pagination.totalOrders,
        totalPages: data.pagination.totalPages
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Erro ao carregar o carrinho.";
      toast.error(msg);
      setOrders([]);
      onTotalChange(0);
      onPaginationChange?.({ totalOrders: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  // carrega ao montar / paginar / sinal externo
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, reloadSignal]);

  // abre/fecha modal de remoção
  const handleOpenModal = (order: CartOrder) => setSelectedOrder(order);
  const handleModalClose = () => setSelectedOrder(null);

  // Confirma remoção do item selecionado
  const handleDeletion = async () => {
    if (!selectedOrder) return;
    try {
      setDeleting(prev => ({ ...prev, [selectedOrder.documentId]: true }));
      await removeOrder(selectedOrder.documentId);
      toast.success("Produto removido do carrinho!");
      setSelectedOrder(null);
      await fetchOrders(); // sincroniza total/página
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Não foi possível remover o produto.";
      toast.error(msg);
    } finally {
      setDeleting(prev => ({ ...prev, [selectedOrder?.documentId ?? '']: false }));
    }
  };

  // Atualiza quantidade no backend com UI otimista
  const handleQuantityChange = async (order: CartOrder, newQuantity: number) => {
    // limita quantidade entre 1 e o estoque
    const qty = Math.max(1, Math.min(newQuantity, order.stock));
    if (qty === order.quantity) return;

    try {
      setUpdating(prev => ({ ...prev, [order.documentId]: true }));

      // 1) Total atual antes de mudar localmente
      const currentTotal = orders.reduce((sum, o) => sum + o.price * o.quantity, 0);
      // 2) Total otimista já com a nova quantidade do item
      const optimisticTotal = currentTotal - order.price * order.quantity + order.price * qty;
      onTotalChange(optimisticTotal); // envia NÚMERO (corrige o erro do TS)

      // 3) Atualiza localmente o item (UI otimista)
      setOrders(prev =>
        prev.map(o => (o.documentId === order.documentId ? { ...o, quantity: qty } : o))
      );

      // 4) Persiste no backend
      await updateQuantityOrder({ order: order.documentId, quantity: qty });

      // 5) Refaz o fetch para garantir consistência (total do backend prevalece)
      await fetchOrders();
      toast.success("Quantidade atualizada!");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Não foi possível atualizar a quantidade.";
      toast.error(msg);
      // Reverte via refetch
      fetchOrders();
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
            {!loading && orders.length === 0 && (
              <tr>

              </tr>
            )}

            {orders.map(order => {
              const isUpdating = !!updating[order.documentId];
              const isDeleting = !!deleting[order.documentId];

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
