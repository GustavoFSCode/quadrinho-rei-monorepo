'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  TableContainer,
  Table,
  TableRow,
  TableHeadCell,
  TableBody,
  TableBodyCell,
  ActionsCell,
  IconButton,
} from './styled';
import Button from '@/components/Button';
import ToggleButton from '@/components/Button/ToggleTable';
import Trash from '@/components/icons/Trash';
import ModalExcluirCupom from '@/components/Modals/Cupons/ExcluirCupom';
import {
  getPromotionalCoupons,
  toggleCouponStatus,
  PromotionalCoupon,
  PromotionalCouponsResponse,
} from '@/services/promotionalCouponService';
import 'react-toastify/dist/ReactToastify.css';

interface TabelaProps {
  currentPage?: number;
  itemsPerPage?: number;
  onTotalChange?: (total: number) => void;
}

const Tabela: React.FC<TabelaProps> = ({
  currentPage = 1,
  itemsPerPage = 12,
  onTotalChange,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [couponToDelete, setCouponToDelete] = useState<PromotionalCoupon | null>(null);

  const { data: couponsResponse, isLoading, error } = useQuery({
    queryKey: ['promotional-coupons', currentPage, itemsPerPage],
    queryFn: () => getPromotionalCoupons(currentPage, itemsPerPage),
  });

  // Extrair dados e paginação da resposta
  const coupons = Array.isArray(couponsResponse)
    ? couponsResponse
    : couponsResponse?.data || [];
  const pagination = !Array.isArray(couponsResponse) ? couponsResponse?.pagination : null;

  // Notificar sobre total de itens quando a paginação mudar
  React.useEffect(() => {
    if (pagination && onTotalChange) {
      onTotalChange(pagination.total);
    } else if (Array.isArray(couponsResponse) && onTotalChange) {
      onTotalChange(couponsResponse.length);
    }
  }, [pagination, couponsResponse, onTotalChange]);

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCouponStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-coupons'] });
      toast.success('Status alterado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar status');
    },
  });

  const handleToggleStatus = (coupon: PromotionalCoupon) => {
    toggleStatusMutation.mutate({
      id: coupon.documentId,
      isActive: !coupon.isActive,
    });
  };

  const handleViewUsages = (coupon: PromotionalCoupon) => {
    router.push(`/trocas/promocionais/${coupon.code}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return <div>Carregando cupons...</div>;
  }

  if (error) {
    return <div>Erro ao carregar cupons. Tente novamente.</div>;
  }

  return (
    <>
      <TableContainer>
        <Table>
          <thead>
            <TableRow>
              <TableHeadCell align="left" paddingLeft="15px">
                Nome do cupom
              </TableHeadCell>
              <TableHeadCell align="center">Limite por cliente</TableHeadCell>
              <TableHeadCell align="center">Valor do cupom</TableHeadCell>
              <TableHeadCell align="center">Ações</TableHeadCell>
            </TableRow>
          </thead>
          <TableBody>
            {coupons.map((coupon: PromotionalCoupon) => (
              <TableRow key={coupon.id}>
                <TableBodyCell align="left">{coupon.title}</TableBodyCell>
                <TableBodyCell align="center">
                  {coupon.usageLimit}
                </TableBodyCell>
                <TableBodyCell align="center">
                  {formatCurrency(coupon.price)}
                </TableBodyCell>
                <ActionsCell>
                  <IconButton
                    onClick={() => setCouponToDelete(coupon)}
                    title="Excluir cupom"
                    disabled={coupon.usageCount > 0}
                  >
                    <Trash />
                  </IconButton>
                  <Button
                    text="Visualizar usos"
                    type="button"
                    variant="purple"
                    width="140px"
                    height="30px"
                    onClick={() => handleViewUsages(coupon)}
                  />
                  <ToggleButton
                    isActive={coupon.isActive}
                    onToggle={() => handleToggleStatus(coupon)}
                  />
                </ActionsCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {couponToDelete && (
        <ModalExcluirCupom
          coupon={couponToDelete}
          onClose={() => setCouponToDelete(null)}
        />
      )}
    </>
  );
};

export default Tabela;
