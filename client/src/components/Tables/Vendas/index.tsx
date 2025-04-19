// src/components/Tabela/index.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

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

interface Product {
  id: number;
  title: string;
  qtd: number;
}

interface Order {
  id: number;
  customerName: string;
  date: string;
  status: string;
  products: Product[];
}

// opções fixas do select de status
const statusOptions = [
  { value: 'Em processamento', label: 'Em processamento' },
  { value: 'Pagamento realizado', label: 'Pagamento realizado' },
  { value: 'Pedido cancelado', label: 'Pedido cancelado' },
  { value: 'Pagamento recusado', label: 'Pagamento recusado' },
  { value: 'Em transporte', label: 'Em transporte' },
  { value: 'Entregue', label: 'Entregue' },
];

const initialOrders: Order[] = [
  {
    id: 1,
    customerName: 'Gustavo Ferreira',
    date: '21/03/2025',
    status: 'Entregue',
    products: [
      { id: 1, title: 'Homem‑Aranha: N°1', qtd: 3 },
      { id: 2, title: 'Homem‑Aranha: N°2', qtd: 1 },
      { id: 3, title: 'Homem‑Aranha: N°3', qtd: 4 },
    ],
  },
  {
    id: 2,
    customerName: 'Peter Parker',
    date: '22/03/2025',
    status: 'Em processamento',
    products: [
      { id: 4, title: 'Batman: Ano Um', qtd: 2 },
      { id: 5, title: 'Superman: Entre a Foice e o Martelo', qtd: 1 },
    ],
  },
  {
    id: 3,
    customerName: 'Gabriel Ferreira',
    date: '23/03/2025',
    status: 'Pagamento recusado',
    products: [{ id: 6, title: 'Watchmen', qtd: 1 }],
  },
  {
    id: 4,
    customerName: 'Gustavo Ferreira',
    date: '28/03/2025',
    status: 'Entregue',
    products: [
      { id: 7, title: 'Batman: O Longo Dia Das Bruxas', qtd: 2 },
      { id: 8, title: 'Homem‑Aranha: A Última Caçada de Kraven', qtd: 1 },
      { id: 9, title: 'Homem‑Aranha: A Morte de Gwen Stacy', qtd: 1 },
      { id: 10, title: 'Batman: Noite Sombria', qtd: 2 },
      { id: 11, title: 'Superman: O Último Herói', qtd: 3 },
      { id: 12, title: 'Venom: Carnificina', qtd: 1 },
    ],
  },
];

const Tabela: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    toast.success(`Status do pedido #${orderId} alterado para "${newStatus}"`);
  };

  return (
    <Flex $direction="column" $gap="4rem">
      {orders.map(order => (
        <Flex key={order.id} $direction="column">
          <OrderHeader>
            <OrderText>Pedido - #{order.id}</OrderText>
            <OrderText>Nome do cliente: {order.customerName}</OrderText>
            <OrderText>Data da compra: {order.date}</OrderText>
            <OrderText>
              <Flex $direction="row" $gap="1rem" $align="center">
                Status:{' '}
                <CustomSelect
                  name={`status-${order.id}`}
                  options={statusOptions}
                  value={order.status}
                  width="220px"
                  onChange={opt =>
                    opt && handleStatusChange(order.id, opt.value)
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
                {order.products.map(product => (
                  <TableRow key={product.id}>
                    <TableBodyCell productTitle>{product.title}</TableBodyCell>
                    <TableBodyCell center>{product.qtd}</TableBodyCell>
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
