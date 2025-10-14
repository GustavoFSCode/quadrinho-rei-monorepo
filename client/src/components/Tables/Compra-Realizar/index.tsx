import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { getPurchase, CartOrder, Coupon, removeCoupon } from '@/services/checkoutService';
import Button from '@/components/Button';
import { toast } from 'react-toastify';

interface TabelaProps {
  onTotalChange: (total: number) => void;
}

const Tabela: React.FC<TabelaProps> = ({ onTotalChange }) => {
  const queryClient = useQueryClient();

  const { data: purchase, isLoading, error } = useQuery({
    queryKey: ['purchase'],
    queryFn: getPurchase,
    retry: 1,
  });

  const removeCouponMutation = useMutation({
    mutationFn: (couponDocumentId: string) => removeCoupon(couponDocumentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Cupom removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['purchase'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover cupom');
    },
  });

  const handleRemoveCoupon = (couponDocumentId: string) => {
    removeCouponMutation.mutate(couponDocumentId);
  };

  useEffect(() => {
    if (purchase) {
      // Usar totalPrice que já inclui desconto dos cupons
      onTotalChange(purchase.totalPrice || 0);
    }
  }, [purchase, onTotalChange]);

  if (isLoading) {
    return (
      <Flex $direction="column">
        <h2>Pedido</h2>
        <div>Carregando itens do carrinho...</div>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex $direction="column">
        <h2>Pedido</h2>
        <div>Erro ao carregar itens do carrinho.</div>
      </Flex>
    );
  }

  if (!purchase?.orders || purchase.orders.length === 0) {
    return (
      <Flex $direction="column">
        <h2>Pedido</h2>
        <div>Carrinho vazio.</div>
      </Flex>
    );
  }

  return (
    <Flex $direction="column">
      <h2>Pedido</h2>
      <TableContainer>
        <Table aria-label="Tabela de Produtos">
          <TableHead>
            <TableRow>
              <TableHeadCell>Produtos</TableHeadCell>
              <TableHeadCell>Preço Unitário</TableHeadCell>
              <TableHeadCell center>Quantidade</TableHeadCell>
              <TableHeadCell>Total</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchase.orders.map((order: CartOrder) => (
              <TableRow key={order.id}>
                <TableBodyCell productTitle>{order.product?.title || 'N/A'}</TableBodyCell>
                <TableBodyCell>
                  {order.totalValue && order.quantity ?
                    (order.totalValue / order.quantity).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }) : 'N/A'}
                </TableBodyCell>
                <TableBodyCell center>{order.quantity}</TableBodyCell>
                <TableBodyCell>
                  {order.totalValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {purchase.coupons && purchase.coupons.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Cupons Aplicados</h3>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Código do Cupom</TableHeadCell>
                  <TableHeadCell>Desconto</TableHeadCell>
                  <TableHeadCell center>Ações</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchase.coupons.map((coupon: Coupon) => (
                  <TableRow key={coupon.id}>
                    <TableBodyCell>{coupon.code}</TableBodyCell>
                    <TableBodyCell>
                      -{coupon.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableBodyCell>
                    <TableBodyCell center>
                      <Button
                        text={removeCouponMutation.isPending ? 'Removendo...' : 'Remover Cupom'}
                        type="button"
                        variant="red"
                        width="150px"
                        height="35px"
                        onClick={() => handleRemoveCoupon(coupon.documentId)}
                        disabled={removeCouponMutation.isPending}
                      />
                    </TableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </Flex>
  );
};

export default Tabela;
