// src/services/cartService.ts

import api from './api';

export interface CartOrder {
  documentId: string;
  title: string;
  price: number;
  stock: number;
  quantity: number;
}

export interface OrdersPagination {
  page: number;
  pageSize: number;
  totalOrders: number;
  totalPages: number;
}

export interface OrdersData {
  totalValue: number;
  orders: CartOrder[];
  pagination: OrdersPagination;
}

export interface CreateOrderPayload {
  product: string;
  quantity: number;
}

export interface UpdateQuantityOrderPayload {
  order: string;
  quantity: number;
}

export interface ApiMessageResponse {
  message: string;
}

interface RawOrdersPagination {
  page: number | string;
  pageSize: number | string;
  totalOrders: number | string;
  totalPages: number | string;
}

interface RawGetOrdersResponse {
  data: {
    totalValue: number;
    orders: CartOrder[];
    pagination: RawOrdersPagination;
  };
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<ApiMessageResponse> {
  const { data } = await api.post<ApiMessageResponse>('/createOrder', payload);
  return data;
}

export async function updateQuantityOrder(
  payload: UpdateQuantityOrderPayload
): Promise<ApiMessageResponse> {
  const { data } = await api.put<ApiMessageResponse>(
    '/updateQuantityOrder',
    payload
  );
  return data;
}

export async function removeOrder(
  orderDocumentId: string
): Promise<ApiMessageResponse> {
  const { data } = await api.delete<ApiMessageResponse>(
    `/removeOrder/${orderDocumentId}`
  );
  return data;
}

export async function removeAllOrders(): Promise<ApiMessageResponse> {
  const { data } = await api.delete<ApiMessageResponse>('/removeAllOrders');
  return data;
}

export async function getOrders(
  page?: number,
  pageSize?: number
): Promise<OrdersData> {
  const params: any = {};
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;

  const { data } = await api.get<RawGetOrdersResponse>('/getOrders', { params });

  const raw = data.data;
  const p = raw.pagination;

  const pagination: OrdersPagination = {
    page: Number(p.page),
    pageSize: Number(p.pageSize),
    totalOrders: Number(p.totalOrders),
    totalPages: Number(p.totalPages),
  };

  return {
    totalValue: raw.totalValue,
    orders: raw.orders,
    pagination,
  };
}

export async function createOrUpdatePurchase<T = unknown>(
  payload?: Record<string, unknown>
): Promise<T> {
  const { data } = await api.post<T>('/createUpdatePurchase', payload ?? {});
  return data;
}
