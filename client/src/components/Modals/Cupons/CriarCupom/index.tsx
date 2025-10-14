'use client';

import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PromotionalCouponSchema, IPromotionalCouponForm } from '@/validations/PromotionalCouponSchema';
import { createPromotionalCoupon } from '@/services/promotionalCouponService';
import { unformatCurrency, currencyMask } from '@/utils/masks';
import Input from '@/components/Inputs/Input/Input';
import Closed from '@/components/icons/Closed';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  SubmitButton,
  ErrorMessage,
} from './styled';

interface ModalCriarCupomProps {
  onClose: () => void;
}

const ModalCriarCupom: React.FC<ModalCriarCupomProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [priceValue, setPriceValue] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IPromotionalCouponForm>({
    resolver: yupResolver(PromotionalCouponSchema),
    defaultValues: {
      title: '',
      usageLimit: 1,
      price: 0,
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: createPromotionalCoupon,
    onSuccess: (response) => {
      toast.success(response.message || 'Cupom criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['promotional-coupons'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar cupom');
    },
  });

  const onSubmit: SubmitHandler<IPromotionalCouponForm> = async (data) => {
    createCouponMutation.mutate(data);
  };

  const handlePriceChange = (value: string, onChange: (value: number) => void) => {
    let numericValue = unformatCurrency(value);
    if (isNaN(numericValue)) numericValue = 0;

    const formattedValue = numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    setPriceValue(formattedValue);

    onChange(numericValue);
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Criar cupom promocional
          <Closed onClick={onClose} name="closeCouponForm" />
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="title"
              label="Título do cupom"
              placeholder="Ex: NATAL20"
              {...register('title')}
              error={errors.title?.message}
            />

            <Input
              id="usageLimit"
              label="Limite de usos por cliente"
              type="number"
              placeholder="Ex: 2 (cada cliente poderá usar 2 vezes)"
              {...register('usageLimit')}
              error={errors.usageLimit?.message}
            />

            <Controller
              control={control}
              name="price"
              defaultValue={0}
              render={({ field }) => (
                <Input
                  id="price"
                  label="Valor do cupom (R$)"
                  type="text"
                  maskFunction={currencyMask}
                  placeholder="R$ 0,00"
                  value={priceValue}
                  onChange={(e) => handlePriceChange(e.target.value, field.onChange)}
                  error={errors.price?.message}
                />
              )}
            />

            <SubmitButton type="submit" disabled={isSubmitting || createCouponMutation.isPending}>
              {isSubmitting || createCouponMutation.isPending
                ? 'Criando...'
                : 'Criar cupom promocional'}
            </SubmitButton>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModalCriarCupom;
