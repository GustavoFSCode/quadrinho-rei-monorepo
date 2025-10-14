'use client';
import React from 'react';
import {
  TableContainer,
  Table,
  TableRow,
  TableHeadCell,
  TableBody,
  TableBodyCell,
  EmptyMessage,
} from './styled';
import { CouponUsage } from '@/services/promotionalCouponService';

interface TabelaProps {
  usages: CouponUsage[];
}

const Tabela: React.FC<TabelaProps> = ({ usages }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (!usages || usages.length === 0) {
    return (
      <TableContainer>
        <EmptyMessage>Este cupom ainda não foi utilizado.</EmptyMessage>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <thead>
          <TableRow>
            <TableHeadCell align="left" paddingLeft="15px">
              Nome do cliente
            </TableHeadCell>
            <TableHeadCell align="center">Usos do cliente</TableHeadCell>
            <TableHeadCell align="center">ID do pedido</TableHeadCell>
            <TableHeadCell align="center">Valor total do pedido</TableHeadCell>
            <TableHeadCell align="center">Data de uso</TableHeadCell>
          </TableRow>
        </thead>
        <TableBody>
          {usages.map((usage: CouponUsage) => (
            <TableRow key={usage.id}>
              <TableBodyCell align="left">{usage.clientName || 'N/A'}</TableBodyCell>
              <TableBodyCell align="center">
                {usage.clientUsageCount || 0} {usage.clientUsageCount === 1 ? 'uso' : 'usos'}
              </TableBodyCell>
              <TableBodyCell align="center">{usage.id || 'N/A'}</TableBodyCell>
              <TableBodyCell align="center">
                {formatCurrency(usage.totalValue)}
              </TableBodyCell>
              <TableBodyCell align="center">{formatDate(usage.date)}</TableBodyCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Tabela;
