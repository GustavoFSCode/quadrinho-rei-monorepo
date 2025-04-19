// src/components/Tables/Trocas/index.tsx
'use client';
import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  TableContainer,
  Table,
  TableRow,
  TableHeadCell,
  TableHeadAction,
  TableBody,
  TableBodyCell,
} from './styled';
import Button from '@/components/Button';
import CustomSelect from '@/components/Select';
import 'react-toastify/dist/ReactToastify.css';

interface Trade {
  id: number;
  customerName: string;
  product: string;
  quantity: number;
  status: string;
  coupon?: string;
  value?: string;
}

const statusOptions = [
  { value: 'Aberto', label: 'Aberto' },
  { value: 'Em troca', label: 'Em troca' },
  { value: 'Troca autorizada', label: 'Troca autorizada' },
  { value: 'Troca recusada', label: 'Troca recusada' },
  { value: 'Troca realizada', label: 'Troca realizada' },
];

const initialTrades: Trade[] = [
  {
    id: 1,
    customerName: 'Gustavo Ferreira',
    product: 'Homem‑Aranha #1',
    quantity: 2,
    status: 'Troca realizada',
    coupon: 'CUPOM1742',
    value: 'R$ 79,90',
  },
  {
    id: 2,
    customerName: 'Peter Parker',
    product: 'Batman: Ano Um',
    quantity: 1,
    status: 'Troca realizada',
    coupon: 'CUPOM3851',
    value: 'R$ 49,90',
  },
  {
    id: 3,
    customerName: 'Bruce Wayne',
    product: 'Superman: Entre a Foice e o Martelo',
    quantity: 3,
    status: 'Troca realizada',
    coupon: 'CUPOM9027',
    value: 'R$ 149,70',
  },
  {
    id: 4,
    customerName: 'Selina Kyle',
    product: 'Mulher‑Gato: Cidade das Sombras',
    quantity: 1,
    status: 'Aberto',
  },
  {
    id: 5,
    customerName: 'Clark Kent',
    product: 'Liga da Justiça: Origem',
    quantity: 2,
    status: 'Em troca',
  },
];

const Tabela: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);

  const handleStatusChange = (id: number, newStatus: string) => {
    setTrades(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)),
    );
    toast.success(`Status da troca #${id} alterado para "${newStatus}"`);
  };

  const handleGenerateCoupon = (id: number) => {
    setTrades(prev =>
      prev.map(t => {
        if (t.id === id && !t.coupon) {
          const code = 'CUPOM' + Math.floor(1000 + Math.random() * 9000);
          const val = `R$ ${(t.quantity * 39.9).toFixed(2)}`;
          return { ...t, coupon: code, value: val };
        }
        return t;
      }),
    );
    toast.success('Cupom gerado com sucesso!');
  };

  return (
    <>
      <ToastContainer />
      <TableContainer>
        <Table>
          <thead>
            <TableRow>
              <TableHeadCell>Nome do cliente</TableHeadCell>
              <TableHeadCell>Produto em troca</TableHeadCell>
              <TableHeadCell center>Quantidade</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadAction>Cupom</TableHeadAction>
              <TableHeadAction>Valor</TableHeadAction>
            </TableRow>
          </thead>
          <TableBody>
            {trades.map(trade => (
              <TableRow key={trade.id}>
                <TableBodyCell>{trade.customerName}</TableBodyCell>
                <TableBodyCell>{trade.product}</TableBodyCell>
                <TableBodyCell center>{trade.quantity}</TableBodyCell>
                <TableBodyCell>
                  <CustomSelect
                    name={`status-${trade.id}`}
                    options={statusOptions}
                    value={trade.status}
                    onChange={opt =>
                      opt && handleStatusChange(trade.id, opt.value)
                    }
                    width="220px"
                  />
                </TableBodyCell>
                <TableBodyCell right>
                  {trade.coupon ? (
                    trade.coupon
                  ) : (
                    <Button
                      text={<>Gerar cupom</>}
                      type="button"
                      variant="purple"
                      width="140px"
                      height="30px"
                      onClick={() => handleGenerateCoupon(trade.id)}
                    />
                  )}
                </TableBodyCell>
                <TableBodyCell right>{trade.value || ''}</TableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Tabela;
