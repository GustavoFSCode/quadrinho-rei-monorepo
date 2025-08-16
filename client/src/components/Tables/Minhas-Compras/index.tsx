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
import { Purchase, requestTrade, CartOrder } from '@/services/purchaseService';
import { formatDateToBrazil } from '@/utils/dateFormatter';
import { useRouter } from 'next/navigation';

interface MinhasComprasTableProps {
  purchases: Purchase[];
  loading?: boolean;
  onRefresh?: () => void;
}

const Tabela: React.FC<MinhasComprasTableProps> = ({
  purchases = [],
  loading = false,
  onRefresh
}) => {

  const initialRefundQuantities: Record<string, number> = {};
  purchases.forEach(purchase => {
    if (purchase.canRefund) {
      purchase.orders.forEach(order => {
        initialRefundQuantities[order.documentId] = 1;
      });
    }
  });
  const [refundQuantities, setRefundQuantities] = useState<
    Record<string, number>
  >(initialRefundQuantities);
  const [refundChecks, setRefundChecks] = useState<Record<string, boolean>>({});
  const [requestingRefund, setRequestingRefund] = useState<Record<string, boolean>>({});
  const router = useRouter();


  const handleRefundQuantityChange = (orderDocumentId: string, newQuantity: number) => {
    setRefundQuantities(prev => ({
      ...prev,
      [orderDocumentId]: newQuantity,
    }));
  };

  const handleRefund = async (purchase: Purchase, order: CartOrder) => {
    const quantity = refundQuantities[order.documentId] || 1;

    if (quantity > order.availableRefundQuantity) {
      toast.error('Quantidade solicitada excede o disponível para reembolso');
      return;
    }

    try {
      setRequestingRefund(prev => ({ ...prev, [order.documentId]: true }));

      await requestTrade({
        purchase: purchase.documentId,
        order: order.documentId,
        quantity: quantity
      });

      toast.success('Pedido de reembolso realizado com sucesso!');
      setRefundChecks(prev => ({ ...prev, [order.documentId]: false }));
      router.push('/minhas-compras/minhas-trocas');

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Erro ao solicitar reembolso:', error);
      toast.error(error?.response?.data?.message || 'Erro ao solicitar reembolso');
    } finally {
      setRequestingRefund(prev => ({ ...prev, [order.documentId]: false }));
    }
  };

  if (loading) {
    return (
      <Flex $direction="column" $gap="2rem">
        <p>Carregando suas compras...</p>
      </Flex>
    );
  }

  if (purchases.length === 0) {
    return (
      <Flex $direction="column" $gap="2rem">
        <p>Nenhuma compra encontrada.</p>
      </Flex>
    );
  }

  return (
    <Flex $direction="column" $gap="4rem">
      {purchases.map(purchase => (
        <React.Fragment key={purchase.documentId}>
          <Flex $direction="column">
            <OrderHeader>
              <OrderText>Pedido - #{purchase.id}</OrderText>
              <OrderText>Data da compra: {purchase.date ? formatDateToBrazil(purchase.date) : 'N/A'}</OrderText>
              <OrderText>Status: {purchase.status?.name || 'N/A'}</OrderText>
            </OrderHeader>
            <TableContainer>
              <Table aria-label="Tabela de Produtos">
                <TableHead>
                  <TableRow>
                    <TableHeadCell>Produtos</TableHeadCell>
                    <TableHeadCell center>Quantidade</TableHeadCell>
                    <TableHeadCell center>Disponível para reembolso</TableHeadCell>
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
                  {purchase.orders.map(order => (
                    <TableRow key={order.documentId}>
                      <TableBodyCell productTitle>
                        {order.product.title}
                      </TableBodyCell>
                      <TableBodyCell center>{order.quantity}</TableBodyCell>
                      <TableBodyCell center>{order.availableRefundQuantity}</TableBodyCell>
                      {purchase.canRefund ? (
                        order.availableRefundQuantity > 0 ? (
                          <>
                            <TableBodyCell center>
                              <Checkbox
                                checked={refundChecks[order.documentId] || false}
                                onChange={e =>
                                  setRefundChecks(prev => ({
                                    ...prev,
                                    [order.documentId]: e.target.checked,
                                  }))
                                }
                              />
                            </TableBodyCell>
                            <TableBodyCell center>
                              <InputNumber
                                value={refundQuantities[order.documentId] || 1}
                                setValue={value =>
                                  handleRefundQuantityChange(order.documentId, value)
                                }
                                max={order.availableRefundQuantity}
                                min={1}
                              />
                            </TableBodyCell>
                            <TableBodyCell center>
                              <Button
                                text={<>Reembolso</>}
                                type="button"
                                variant="purple"
                                width="140px"
                                height="30px"
                                onClick={() => handleRefund(purchase, order)}
                                disabled={!refundChecks[order.documentId] || requestingRefund[order.documentId]}
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
