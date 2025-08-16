import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrders,
  createOrder,
  updateQuantityOrder,
  removeOrder,
  removeAllOrders,
  CreateOrderPayload,
  UpdateQuantityOrderPayload,
} from '@/services/cartService';
import { toast } from 'react-toastify';

export const CART_QUERY_KEYS = {
  all: ['cart'] as const,
  orders: (page?: number, pageSize?: number) => ['cart', 'orders', page, pageSize] as const,
};

export function useCartOrders(page?: number, pageSize?: number) {
  return useQuery({
    queryKey: CART_QUERY_KEYS.orders(page, pageSize),
    queryFn: () => getOrders(page, pageSize),
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(data?.message || 'Produto adicionado ao carrinho!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Não foi possível adicionar ao carrinho.';
      toast.error(msg);
    },
  });
}

export function useUpdateQuantityOrderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: UpdateQuantityOrderPayload) => updateQuantityOrder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(data?.message || 'Quantidade atualizada!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Não foi possível atualizar a quantidade.';
      toast.error(msg);
    },
  });
}

export function useRemoveOrderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderDocumentId: string) => removeOrder(orderDocumentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(typeof data === 'string' ? data : 'Produto removido do carrinho!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Não foi possível remover o produto.';
      toast.error(msg);
    },
  });
}

export function useRemoveAllOrdersMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => removeAllOrders(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(typeof data === 'string' ? data : 'Carrinho esvaziado com sucesso!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Não foi possível esvaziar o carrinho.';
      toast.error(msg);
    },
  });
}