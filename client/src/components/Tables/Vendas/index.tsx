import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeadCell,
  TableBody,
  TableBodyCell,
  OrderHeader,
  OrderText,
} from './styled';
import { Flex } from '@/styles/global';
import CustomSelect from '@/components/Select';
import { getSales, getSalesStatus, updateSaleStatus, Sale, SalesStatus } from '@/services/salesService';
import { formatDateToBrazil } from '@/utils/dateFormatter';

const Tabela: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: salesData, isLoading: salesLoading, error: salesError } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: statusOptions, isLoading: statusLoading } = useQuery({
    queryKey: ['salesStatus'],
    queryFn: getSalesStatus,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ saleId, statusId }: { saleId: string; statusId: string }) =>
      updateSaleStatus(saleId, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Status alterado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar status');
    },
  });

  const handleStatusChange = (saleId: string, statusId: string) => {
    updateStatusMutation.mutate({ saleId, statusId });
  };


  if (salesLoading || statusLoading) {
    return <div>Carregando vendas...</div>;
  }

  if (salesError) {
    return <div>Erro ao carregar vendas. Tente novamente.</div>;
  }

  const sales = salesData?.data || [];
  const statusOptionsFormatted = statusOptions?.map(status => ({
    value: status.documentId,
    label: status.name,
  })) || [];

  return (
    <Flex $direction="column" $gap="4rem">
      {sales.map((sale: Sale) => (
        <Flex key={sale.id} $direction="column">
          <OrderHeader>
            <OrderText>Pedido - #{sale.id}</OrderText>
            <OrderText>Nome do cliente: {sale.client?.name || 'N/A'}</OrderText>
            <OrderText>Data da compra: {formatDateToBrazil(sale.date)}</OrderText>
            <OrderText>
              <Flex $direction="row" $gap="1rem" $align="center">
                Status:{' '}
                <CustomSelect
                  name={`status-${sale.id}`}
                  options={statusOptionsFormatted}
                  value={sale.purchaseSalesStatus?.documentId || ''}
                  width="220px"
                  onChange={opt =>
                    opt && handleStatusChange(sale.documentId, opt.value)
                  }
                />
              </Flex>
            </OrderText>
          </OrderHeader>

          <TableContainer>
            <Table aria-label="Tabela de Produtos">
              <TableHead>
                <TableRow>
                  <TableHeadCell>Produtos</TableHeadCell>
                  <TableHeadCell center>Quantidade</TableHeadCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sale.cartOrders?.map(order => (
                  <TableRow key={order.id}>
                    <TableBodyCell productTitle>{order.product?.title || 'N/A'}</TableBodyCell>
                    <TableBodyCell center>{order.quantity}</TableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Flex>
      ))}
    </Flex>
  );
};

export default Tabela;
