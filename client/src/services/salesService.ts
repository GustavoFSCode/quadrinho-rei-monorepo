import api from './api';

export interface SalesStatus {
  id: number;
  documentId: string;
  name: string;
}

export interface CartOrder {
  id: number;
  documentId: string;
  quantity: number;
  totalValue: number;
  product: {
    title: string;
  };
}

export interface Client {
  id: number;
  documentId: string;
  name: string;
  cpf: string;
  phone: string;
}

export interface Sale {
  id: number;
  documentId: string;
  date: string;
  totalValue: number;
  client: Client;
  purchaseSalesStatus: SalesStatus;
  cartOrders: CartOrder[];
}

export interface ApiMessageResponse {
  message: string;
}

export async function getSales(): Promise<{ data: Sale[] }> {
  try {
    const response = await api.get<{ data: Sale[] }>('/getSales');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    throw error;
  }
}

export async function getSalesStatus(): Promise<SalesStatus[]> {
  try {
    const response = await api.get<SalesStatus[]>('/getSalesStatus');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales status:', error);
    throw error;
  }
}

export async function updateSaleStatus(
  saleId: string,
  statusId: string
): Promise<ApiMessageResponse> {
  try {
    const response = await api.put<ApiMessageResponse>(
      `/editSalesStatus/${saleId}`,
      { status: statusId }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating sale status:', error);
    throw error;
  }
}