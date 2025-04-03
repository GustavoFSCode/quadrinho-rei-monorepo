import React, { useState } from 'react';
import Input from '@/components/Inputs/Input/Input';
import { SubmitButton, ErrorMessage, FormContainer } from './Styled';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CupomForm: React.FC = () => {
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!coupon.trim()) {
      setError('O código do cupom é obrigatório');
      return;
    }

    // Aqui você pode implementar a lógica de validação/integrar com API.
    toast.success('Cupom aplicado com sucesso!');
    setCoupon('');
    setError('');
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
      <SubmitButton type="submit">Aplicar cupom</SubmitButton>
    </FormContainer>
  );
};

export default CupomForm;
