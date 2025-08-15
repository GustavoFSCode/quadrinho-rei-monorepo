// src/services/purchaseService.ts

import api from './api';

export interface PurchaseStatus {
  id: number;
  documentId: string;
  name: string;
}

export interface CartOrder {
  id: number;
  documentId: string;
  quantity: number;
  quantityRefund: number;
  totalValue: number;
  availableRefundQuantity: number;
  product: {
    title: string;
  };
}

export interface Purchase {
  id: number;
  documentId: string;
  date: string;
  status: PurchaseStatus;
  orders: CartOrder[];
  canRefund: boolean;
}

export interface PaginatedPurchasesResponse {
  data: {
    purchases: Purchase[];
    pagination: {
      page: number;
      pageSize: number;
      totalOrders: number;
      totalPages: number;
    };
  };
}

export interface TradeStatus {
  id: number;
  documentId: string;
  name: string;
}

export interface Coupon {
  id: number;
  documentId: string;
  code: string;
  price: number;
}

export interface Trade {
  id: number;
  documentId: string;
  totalValue: number;
  createdAt: string;
  tradeStatus: TradeStatus;
  coupon?: Coupon;
  cartOrder: {
    id: number;
    documentId: string;
    quantity: number;
    product: {
      title: string;
    };
  };
}

export interface RequestTradePayload {
  purchase: string;
  order: string;
  quantity: number;
}

export interface ApiMessageResponse {
  message: string;
}

// Get user's purchase history
export async function getMyPurchases(
  page?: number,
  pageSize?: number
): Promise<Purchase[] | PaginatedPurchasesResponse> {
  try {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const { data } = await api.get<Purchase[] | PaginatedPurchasesResponse>('/getMyPurchases', { params });
    return data;
  } catch (error: any) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
}

// Get user's trade requests
export async function getMyTrades(): Promise<Trade[]> {
  try {
    const { data } = await api.get<Trade[]>('/getMyTrades');
    return data;
  } catch (error: any) {
    console.error('Error fetching trades:', error);
    throw error;
  }
}

// Request a trade/refund for a specific order
export async function requestTrade(
  payload: RequestTradePayload
): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.post<ApiMessageResponse>('/requestTrade', payload);
    return data;
  } catch (error: any) {
    console.error('Error requesting trade:', error);
    throw error;
  }
}