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
  Checkbox,
  OrderHeader,
  OrderText,
} from './styled';
import { Flex } from '@/styles/global';
import Button from '@/components/Button';
import InputNumber from '@/components/Inputs/InputNumber/InputNumber';

interface Product {
  id: number;
  title: string;
  qtd: number;
  qtd_refund: number;
}

interface Order {
  id: number;
  date: string;
  status: string;
  products: Product[];
}

const Tabela: React.FC = () => {
  const orders: Order[] = [
    {
      id: 1,
      date: '21/03/2025',
      status: 'Entregue',
      products: [
        { id: 1, title: 'Homem-Aranha: N°1', qtd: 3, qtd_refund: 3 },
        { id: 2, title: 'Homem-Aranha: N°2', qtd: 1, qtd_refund: 1 },
        { id: 3, title: 'Homem-Aranha: N°3', qtd: 4, qtd_refund: 0 },
        { id: 11, title: 'Batman: Noite Sombria', qtd: 2, qtd_refund: 2 },
        { id: 12, title: 'Superman: O Último Herói', qtd: 3, qtd_refund: 3 },
      ],
    },
    {
      id: 2,
      date: '22/03/2025',
      status: 'Em processamento',
      products: [
        { id: 4, title: 'Homem-Aranha: N°10', qtd: 5, qtd_refund: 5 },
        { id: 5, title: 'Homem-Aranha: N°11', qtd: 2, qtd_refund: 2 },
      ],
    },
    {
      id: 3,
      date: '23/03/2025',
      status: 'Pagamento recusado',
      products: [{ id: 6, title: 'Homem-Aranha: N°20', qtd: 1, qtd_refund: 1 }],
    },
  ];

  // Inicializa estados apenas para orders com status "Entregue"
  const initialRefundQuantities: Record<number, number> = {};
  orders.forEach(order => {
    if (order.status === 'Entregue') {
      order.products.forEach(product => {
        initialRefundQuantities[product.id] = 1;
      });
    }
  });
  const [refundQuantities, setRefundQuantities] = useState<
    Record<number, number>
  >(initialRefundQuantities);
  const [refundChecks, setRefundChecks] = useState<Record<number, boolean>>({});

  const handleRefundQuantityChange = (id: number, newQuantity: number) => {
    setRefundQuantities(prev => ({
      ...prev,
      [id]: newQuantity,
    }));
  };

  const handleRefund = (id: number) => {
    toast.success('Pedido de reembolso realizado com sucesso!');
    // Outras ações de reembolso podem ser implementadas aqui
  };

  return (
    <Flex $direction="column" $gap="4rem">
      {orders.map(order => (
        <React.Fragment key={order.id}>
          <Flex $direction="column">
            <OrderHeader>
              <OrderText>Pedido - #{order.id}</OrderText>
              <OrderText>Data da compra: {order.date}</OrderText>
              <OrderText>Status: {order.status}</OrderText>
            </OrderHeader>
            <TableContainer>
              <Table aria-label="Tabela de Produtos">
                <TableHead>
                  <TableRow>
                    <TableHeadCell>Produtos</TableHeadCell>
                    <TableHeadCell center>Quantidade</TableHeadCell>
                    <TableHeadCell center>
                      Selecionar para reembolso
                    </TableHeadCell>
                    <TableHeadCell center>
                      Quantidade para reembolso
                    </TableHeadCell>
                    <TableHeadCell center>Ações</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.products.map(product => (
                    <TableRow key={product.id}>
                      <TableBodyCell productTitle>
                        {product.title}
                      </TableBodyCell>
                      <TableBodyCell center>{product.qtd}</TableBodyCell>
                      {order.status === 'Entregue' ? (
                        product.qtd_refund > 0 ? (
                          <>
                            <TableBodyCell center>
                              <Checkbox
                                checked={refundChecks[product.id] || false}
                                onChange={e =>
                                  setRefundChecks(prev => ({
                                    ...prev,
                                    [product.id]: e.target.checked,
                                  }))
                                }
                              />
                            </TableBodyCell>
                            <TableBodyCell center>
                              <InputNumber
                                value={refundQuantities[product.id]}
                                setValue={value =>
                                  handleRefundQuantityChange(product.id, value)
                                }
                                max={product.qtd_refund}
                              />
                            </TableBodyCell>
                            <TableBodyCell center>
                              <Button
                                text={<>Reembolso</>}
                                type="button"
                                variant="purple"
                                width="140px"
                                height="30px"
                                onClick={() => handleRefund(product.id)}
                                disabled={!refundChecks[product.id]}
                              />
                            </TableBodyCell>
                          </>
                        ) : (
                          <>
                            <TableBodyCell center>
                              <Checkbox disabled />
                            </TableBodyCell>
                            <TableBodyCell center>
                              <p>0</p>
                            </TableBodyCell>
                            <TableBodyCell center></TableBodyCell>
                          </>
                        )
                      ) : (
                        <>
                          <TableBodyCell center>
                            <p>Não disponível para reembolso</p>
                          </TableBodyCell>
                          <TableBodyCell center></TableBodyCell>
                          <TableBodyCell center></TableBodyCell>
                        </>
                      )}
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
