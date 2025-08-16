import api from './api';

export interface TradeStatus {
  id: number;
  documentId: string;
  name: string;
}

export interface Product {
  id: number;
  documentId: string;
  title: string;
}

export interface CartOrder {
  id: number;
  documentId: string;
  quantity: number;
  product: Product;
}

export interface Client {
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
  client: Client;
  cartOrder: CartOrder;
  tradeStatus: TradeStatus;
  coupon?: Coupon;
}

export interface ApiMessageResponse {
  message: string;
}

export interface GenerateCouponResponse {
  data: {
    coupon: Coupon;
    message: string;
  };
}

export async function getTrades(): Promise<Trade[]> {
  try {
    const { data } = await api.get<Trade[]>('/getTrades');
    return data;
  } catch (error: any) {
    console.error('Error fetching trades:', error);
    throw error;
  }
}

export async function getTradesStatuses(): Promise<TradeStatus[]> {
  try {
    const { data } = await api.get<TradeStatus[]>('/getTradesStatuses');
    return data;
  } catch (error: any) {
    console.error('Error fetching trade statuses:', error);
    throw error;
  }
}

export async function updateTradeStatus(
  tradeId: string,
  statusId: string
): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.put<ApiMessageResponse>(
      `/editTradeStatus/${tradeId}`,
      { status: statusId }
    );
    return data;
  } catch (error: any) {
    console.error('Error updating trade status:', error);
    throw error;
  }
}

export async function generateCoupon(
  tradeId: string
): Promise<GenerateCouponResponse> {
  try {
    const { data } = await api.post<GenerateCouponResponse>(
      `/generateCoupon/${tradeId}`
    );
    return data;
  } catch (error: any) {
    console.error('Error generating coupon:', error);
    throw error;
  }
}