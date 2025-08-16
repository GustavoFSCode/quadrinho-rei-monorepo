'use client';
import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TableContainer,
  Table,
  TableRow,
  TableHeadCell,
  TableBody,
  TableBodyCell,
} from './styled';
import Button from '@/components/Button';
import CustomSelect from '@/components/Select';
import { 
  getTrades, 
  getTradesStatuses, 
  updateTradeStatus, 
  generateCoupon,
  Trade,
  TradeStatus 
} from '@/services/tradesService';
import 'react-toastify/dist/ReactToastify.css';

const Tabela: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: trades, isLoading: tradesLoading, error: tradesError } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
  });

  const { data: statusOptions, isLoading: statusLoading } = useQuery({
    queryKey: ['tradesStatuses'],
    queryFn: getTradesStatuses,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ tradeId, statusId }: { tradeId: string; statusId: string }) =>
      updateTradeStatus(tradeId, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success('Status alterado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar status');
    },
  });

  const generateCouponMutation = useMutation({
    mutationFn: (tradeId: string) => generateCoupon(tradeId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success(response.data.message || 'Cupom gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao gerar cupom');
    },
  });

  const handleStatusChange = (tradeId: string, statusId: string): void => {
    updateStatusMutation.mutate({ tradeId, statusId });
  };

  const handleGenerateCoupon = (tradeId: string) => {
    generateCouponMutation.mutate(tradeId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (tradesLoading || statusLoading) {
    return <div>Carregando trocas...</div>;
  }

  if (tradesError) {
    return <div>Erro ao carregar trocas. Tente novamente.</div>;
  }

  const statusOptionsFormatted = statusOptions?.map((status: TradeStatus) => ({
    value: status.documentId,
    label: status.name,
  })) || [];

  return (
    <>
      <ToastContainer />
      <TableContainer>
        <Table>
          <thead>
            <TableRow>
              <TableHeadCell align="left" paddingLeft="15px">
                Nome do cliente
              </TableHeadCell>
              <TableHeadCell align="left" paddingLeft="15px">
                Produto em troca
              </TableHeadCell>
              <TableHeadCell align="center">Quantidade</TableHeadCell>
              <TableHeadCell align="center">Status</TableHeadCell>
              <TableHeadCell align="center">Cupom</TableHeadCell>
              <TableHeadCell align="center">Valor</TableHeadCell>
            </TableRow>
          </thead>
          <TableBody>
            {trades?.map((trade: Trade) => (
              <TableRow key={trade.id}>
                <TableBodyCell align="left">{trade.client?.name || 'N/A'}</TableBodyCell>
                <TableBodyCell align="left">{trade.cartOrder?.product?.title || 'N/A'}</TableBodyCell>
                <TableBodyCell align="center">{trade.cartOrder?.quantity || 0}</TableBodyCell>
                <TableBodyCell align="left">
                  <CustomSelect
                    name={`status-${trade.id}`}
                    options={statusOptionsFormatted}
                    value={trade.tradeStatus?.documentId || ''}
                    onChange={opt => opt && handleStatusChange(trade.documentId, opt.value)}
                    width="220px"
                  />
                </TableBodyCell>
                <TableBodyCell align="center">
                  {trade.coupon ? (
                    trade.coupon.code
                  ) : (
                    <Button
                      text="Gerar cupom"
                      type="button"
                      variant="purple"
                      width="140px"
                      height="30px"
                      onClick={() => handleGenerateCoupon(trade.documentId)}
                    />
                  )}
                </TableBodyCell>
                <TableBodyCell align="center">
                  {trade.coupon ? formatCurrency(trade.coupon.price) : ''}
                </TableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Tabela;