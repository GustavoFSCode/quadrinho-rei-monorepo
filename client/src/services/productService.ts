// src/services/productService.ts

import api from './api';

export interface ProductCategory {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface PrecificationType {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Product {
  id: number;
  documentId: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  issue: string;
  edition: string;
  pageNumber: number;
  synopsis: string;
  isbn: string;
  barCode: string;
  height: number;
  length: number;
  weight: number;
  depth: number;
  priceBuy: number;
  priceSell: number;
  stock: number;
  active: boolean;
  inactiveReason: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  // Relações como objetos completos
  precificationType: PrecificationType;
  productCategories: ProductCategory[];
}

export interface CreateProductPayload {
  title: string;
  author: string;
  publisher: string;
  year: string;
  issue: string;
  edition: string;
  pageNumber: number;
  synopsis: string;
  isbn: string;
  barCode: string;
  height: number;
  length: number;
  weight: number;
  depth: number;
  priceBuy: number;
  priceSell: number;
  stock: number;
  active: boolean;
  inactiveReason: string | null;
  // Continua enviando apenas os IDs das relações:
  precificationType: string;
  productCategories: string[];
}

export interface ProductCategoriesResponse {
  data: ProductCategory[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface PrecificationTypesResponse {
  data: PrecificationType[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export async function getProductsMaster(
  page?: number,
  pageSize?: number
): Promise<Product[]> {
  const params: any = {};
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;

  const { data } = await api.get<Product[]>('/getProductsMaster', { params });
  return data;
}

// NOVO: busca produtos visíveis ao usuário, com filtro e paginação
export async function getProductsUser(
  page?: number,
  pageSize?: number,
  filter?: string
): Promise<
  | Product[]
  | { data: Product[]; totalCount: number; page: number; pageSize: number }
> {
  const params: any = {};
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;
  if (filter) params.filter = filter;

  const response = await api.get<
    | Product[]
    | { data: Product[]; totalCount: number; page: number; pageSize: number }
  >('/getProductsUser', { params });

  return response.data;
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const response = await api.post<{ message: string; data: Product }>(
    '/createProduct',
    payload
  );
  return response.data.data;
}

export async function editProduct(
  productDocumentId: string,
  payload: CreateProductPayload
): Promise<Product> {
  const response = await api.put<{ message: string; data: Product }>(
    `/editProduct/${productDocumentId}`,
    payload
  );
  return response.data.data;
}

export async function deleteProduct(
  productDocumentId: string
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/removeProduct/${productDocumentId}`
  );
  return data;
}

export async function getProductCategories(): Promise<ProductCategoriesResponse> {
  const { data } = await api.get<ProductCategoriesResponse>(
    '/product-categories'
  );
  return data;
}

export async function getPrecificationTypes(): Promise<PrecificationTypesResponse> {
  const { data } = await api.get<PrecificationTypesResponse>(
    '/precification-types'
  );
  return data;
}
