import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Input from '@/components/Inputs/Input/Input';
import { SubmitButton, ErrorMessage, FormContainer } from './Styled';
import { toast } from 'react-toastify';
import { insertCoupon } from '@/services/checkoutService';
import 'react-toastify/dist/ReactToastify.css';

const CupomForm: React.FC = () => {
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const insertCouponMutation = useMutation({
    mutationFn: (couponCode: string) => insertCoupon(couponCode),
    onSuccess: (response) => {
      toast.success(response.message || 'Cupom aplicado com sucesso!');
      setCoupon('');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['purchase'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao aplicar cupom';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!coupon.trim()) {
      setError('O código do cupom é obrigatório');
      return;
    }

    setError('');
    insertCouponMutation.mutate(coupon.trim());
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Input
        id="coupon"
        label="Cupom"
        placeholder="Insira seu cupom"
        value={coupon}
        onChange={(e) => setCoupon(e.target.value)}
        error={error}
      />
      <SubmitButton type="submit" disabled={insertCouponMutation.isPending}>
        {insertCouponMutation.isPending ? 'Aplicando...' : 'Aplicar cupom'}
      </SubmitButton>
    </FormContainer>
  );
};

export default CupomForm;
