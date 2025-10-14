'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { deletePromotionalCoupon, PromotionalCoupon } from '@/services/promotionalCouponService';
import Button from '@/components/Button';
import Image from 'next/image';
import AlertIcon from '@/components/icons/QuestionBox.png';
import {
  ModalOverlay,
  ModalBox,
  ModalContent,
  ModalText,
  ButtonContainer,
} from './styled';

interface ModalExcluirCupomProps {
  coupon: PromotionalCoupon;
  onClose: () => void;
}

const ModalExcluirCupom: React.FC<ModalExcluirCupomProps> = ({ coupon, onClose }) => {
  const queryClient = useQueryClient();

  const deleteCouponMutation = useMutation({
    mutationFn: () => deletePromotionalCoupon(coupon.documentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Cupom excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['promotional-coupons'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao excluir cupom');
      onClose();
    },
  });

  const handleDelete = () => {
    deleteCouponMutation.mutate();
  };

  return (
    <ModalOverlay>
      <ModalBox>
        <ModalContent>
          <Image src={AlertIcon} width={60} height={60} alt="Alert Icon" />
          <ModalText>
            Tem certeza que deseja excluir o cupom <strong>{coupon.title}</strong>?
          </ModalText>
          <ButtonContainer>
            <Button
              text="Cancelar"
              type="button"
              variant="green"
              width="48%"
              height="39px"
              onClick={onClose}
            />
            <Button
              text={deleteCouponMutation.isPending ? 'Excluindo...' : 'Excluir'}
              type="button"
              variant="red"
              width="48%"
              height="39px"
              onClick={handleDelete}
              disabled={deleteCouponMutation.isPending}
            />
          </ButtonContainer>
        </ModalContent>
      </ModalBox>
    </ModalOverlay>
  );
};

export default ModalExcluirCupom;
