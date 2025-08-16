import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeadCell,
  TableBody,
  TableBodyCell,
} from './styled';
import { Flex } from '@/styles/global';
import { Trade } from '@/services/purchaseService';
import { formatDateToBrazil } from '@/utils/dateFormatter';

interface MinhasTrocasTableProps {
  trades: Trade[];
  loading?: boolean;
}

const Tabela: React.FC<MinhasTrocasTableProps> = ({ 
  trades = [], 
  loading = false 
}) => {


  if (loading) {
    return (
      <Flex $direction="column">
        <h2>Trocas</h2>
        <p>Carregando suas trocas...</p>
      </Flex>
    );
  }

  if (trades.length === 0) {
    return (
      <Flex $direction="column">
        <h2>Trocas</h2>
        <p>Nenhuma troca encontrada.</p>
      </Flex>
    );
  }

  return (
    <Flex $direction="column">
      <h2>Trocas</h2>
      <TableContainer>
        <Table aria-label="Tabela de Trocas">
          <TableHead>
            <TableRow>
              <TableHeadCell>Produto</TableHeadCell>
              <TableHeadCell center>Quantidade</TableHeadCell>
              <TableHeadCell center>Valor Total</TableHeadCell>
              <TableHeadCell center>Status</TableHeadCell>
              <TableHeadCell center>Data</TableHeadCell>
              <TableHeadCell center>Cupom</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.map(trade => (
              <TableRow key={trade.documentId}>
                <TableBodyCell productTitle>
                  {trade.cartOrder.product.title}
                </TableBodyCell>
                <TableBodyCell center>
                  {trade.quantity}
                </TableBodyCell>
                <TableBodyCell center>
                  R$ {trade.totalValue.toFixed(2).replace('.', ',')}
                </TableBodyCell>
                <TableBodyCell center>
                  {trade.tradeStatus.name}
                </TableBodyCell>
                <TableBodyCell center>
                  {formatDateToBrazil(trade.createdAt)}
                </TableBodyCell>
                <TableBodyCell center>
                  {trade.coupon && trade.coupon.code
                    ? trade.coupon.code
                    : 'Ainda não gerado'}
                </TableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Flex>
  );
};

export default Tabela;
