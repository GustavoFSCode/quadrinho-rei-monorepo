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
} from './styled';
import { Flex } from '@/styles/global';

interface Product {
  id: number;
  title: string;
  qtd: number;
  date: string;
  status: string;
  qtd_refund: number;
  cupom?: string;
}

const Tabela: React.FC = () => {
  const products: Product[] = [
    {
      id: 1,
      title: 'Homem-Aranha: N°1',
      qtd: 3,
      date: '21/03/2025',
      status: 'Troca realizada',
      qtd_refund: 3,
      cupom: 'CUPOM1349',
    },
    {
      id: 2,
      title: 'Homem-Aranha: N°2',
      qtd: 1,
      date: '21/03/2025',
      status: 'Troca realizada',
      qtd_refund: 1,
      cupom: 'CUPOM1350',
    },
    {
      id: 3,
      title: 'Homem-Aranha: N°3',
      qtd: 4,
      date: '21/03/2025',
      status: 'Troca realizada',
      qtd_refund: 1,
      cupom: 'CUPOM1351',
    },
    {
      id: 11,
      title: 'Batman: Noite Sombria',
      qtd: 2,
      date: '21/03/2025',
      status: 'Troca não aprovada',
      qtd_refund: 2,
      cupom: '',
    },
    {
      id: 12,
      title: 'Superman: O Último Herói',
      qtd: 3,
      date: '21/03/2025',
      status: 'Troca em andamento',
      qtd_refund: 3,
    },
  ];

  // State para quantidade de reembolso, iniciando com 1 para cada produto
  const [refundQuantities, setRefundQuantities] = useState<
    Record<number, number>
  >(() => {
    const initial: Record<number, number> = {};
    products.forEach(product => {
      initial[product.id] = 1;
    });
    return initial;
  });

  // Controle dos checkboxes para reembolso
  const [refundChecks, setRefundChecks] = useState<Record<number, boolean>>({});

  const handleRefundQuantityChange = (id: number, newQuantity: number) => {
    setRefundQuantities(prev => ({
      ...prev,
      [id]: newQuantity,
    }));
  };

  const handleRefund = (id: number) => {
    toast.success('Pedido de reembolso realizada com sucesso!');
    // Outras ações de reembolso podem ser implementadas aqui
  };

  return (
    <Flex $direction="column">
      <h2>Trocas</h2>
      <TableContainer>
        <Table aria-label="Tabela de Produtos">
          <TableHead>
            <TableRow>
              <TableHeadCell>Produtos</TableHeadCell>
              <TableHeadCell center>Quantidade</TableHeadCell>
              <TableHeadCell center>Status</TableHeadCell>
              <TableHeadCell center>Cupom</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableBodyCell productTitle>{product.title}</TableBodyCell>
                <TableBodyCell center>{product.qtd_refund}</TableBodyCell>
                <TableBodyCell center>{product.status}</TableBodyCell>
                <TableBodyCell center>
                  {product.cupom && product.cupom.trim() !== ''
                    ? product.cupom
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
