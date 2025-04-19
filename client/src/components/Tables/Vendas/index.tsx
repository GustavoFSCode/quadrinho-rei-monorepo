// src/components/Tabela/index.tsx
import React, { useState } from 'react';
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

const Tabela: React.FC = () => {
  const orders: Order[] = [
    {
      id: 1,
      customerName: 'Gustavo Ferreira',
      date: '21/03/2025',
      status: 'Entregue',
      products: [
        { id: 1, title: 'Homem-Aranha: N°1', qtd: 3 },
        { id: 2, title: 'Homem-Aranha: N°2', qtd: 1 },
        { id: 3, title: 'Homem-Aranha: N°3', qtd: 4 },
        { id: 11, title: 'Batman: Noite Sombria', qtd: 2 },
        { id: 12, title: 'Superman: O Último Herói', qtd: 3 },
      ],
    },
    {
      id: 2,
      customerName: 'Peter Parker',
      date: '22/03/2025',
      status: 'Em processamento',
      products: [
        { id: 4, title: 'Homem-Aranha: N°10', qtd: 5 },
        { id: 5, title: 'Homem-Aranha: N°11', qtd: 2 },
      ],
    },
    {
      id: 3,
      customerName: 'Gabriel Ferreira',
      date: '23/03/2025',
      status: 'Pagamento recusado',
      products: [{ id: 6, title: 'Homem-Aranha: N°20', qtd: 1 }],
    },
  ];

  const statusOptions = [
    { value: 'Em processamento', label: 'Em processamento' },
    { value: 'Pagamento realizado', label: 'Pagamento realizado' },
    { value: 'Pedido cancelado', label: 'Pedido cancelado' },
    { value: 'Pagamento recusado', label: 'Pagamento recusado' },
    { value: 'Em transporte', label: 'Em transporte' },
    { value: 'Entregue', label: 'Entregue' },
  ];

  const [orderStatuses, setOrderStatuses] = useState<Record<number, string>>(
    orders.reduce((acc, order) => ({ ...acc, [order.id]: order.status }), {}),
  );

  const handleStatusChange = (
    orderId: number,
    option: { value: string; label: string } | null,
  ) => {
    if (option) {
      setOrderStatuses(prev => ({
        ...prev,
        [orderId]: option.value,
      }));
    }
  };

  return (
    <Flex $direction="column" $gap="4rem">
      {orders.map(order => (
        <React.Fragment key={order.id}>
          <Flex $direction="column">
            <OrderHeader>
              <OrderText>Pedido - #{order.id}</OrderText>
              <OrderText>Nome do cliente: {order.customerName}</OrderText>
              <OrderText>Data da compra: {order.date}</OrderText>
              <OrderText>
                Status:
                <CustomSelect
                  name={`status-${order.id}`}
                  options={statusOptions}
                  value={orderStatuses[order.id]}
                  onChange={opt => handleStatusChange(order.id, opt)}
                />
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
                      <TableBodyCell productTitle>
                        {product.title}
                      </TableBodyCell>
                      <TableBodyCell center>{product.qtd}</TableBodyCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Flex>
        </React.Fragment>
      ))}
    </Flex>
  );
};

export default Tabela;
