import { useQuery } from '@tanstack/react-query';
import { getProductsUser } from '@/services/productService';

export const PRODUCTS_QUERY_KEYS = {
  all: ['products'] as const,
  user: (page?: number, pageSize?: number, filter?: string) => 
    ['products', 'user', page, pageSize, filter] as const,
};

export function useProductsUser(page?: number, pageSize?: number, filter?: string) {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.user(page, pageSize, filter),
    queryFn: () => getProductsUser(page, pageSize, filter),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}