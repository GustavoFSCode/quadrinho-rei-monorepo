import api from './api';

export interface CartOrder {
  id: number;
  documentId: string;
  quantity: number;
  totalValue: number;
  product: {
    id: number;
    documentId: string;
    title: string;
    price: number;
  };
}

export interface Address {
  id: number;
  documentId: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  TypeAddress: string;
}

export interface Card {
  id: number;
  documentId: string;
  name: string;
  number: string;
  expirationDate: string;
  cvv: string;
}

export interface Coupon {
  id: number;
  documentId: string;
  code: string;
  price: number;
}

export interface Purchase {
  id?: number;
  documentId?: string;
  totalValue: number;
  coupons: Coupon[];
  addresses: Address[];
  cards: Card[];
  orders: CartOrder[];
  totalPrice: number;
  totalCoupons: number;
}

export interface ApiMessageResponse {
  message: string;
  data?: any;
}

// Obter dados da compra atual (carrinho + cupons + endereços + cartões)
export async function getPurchase(): Promise<Purchase> {
  try {
    const { data } = await api.get<Purchase>('/getPurchase');
    return data;
  } catch (error: any) {
    console.error('Error fetching purchase:', error);
    throw error;
  }
}

// Criar ou atualizar compra pendente
export async function createOrUpdatePurchase(
  freteValue?: number,
  freteRegiao?: string
): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.post<ApiMessageResponse>('/createUpdatePurchase', {
      freteValue,
      freteRegiao
    });
    return data;
  } catch (error: any) {
    console.error('Error creating/updating purchase:', error);
    throw error;
  }
}

// Inserir cupom na compra
export async function insertCoupon(coupon: string): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.post<ApiMessageResponse>('/insertCouponPurchase', {
      coupon
    });
    return data;
  } catch (error: any) {
    console.error('Error inserting coupon:', error);
    throw error;
  }
}

// Remover cupom da compra
export async function removeCoupon(couponDocumentId: string): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.post<ApiMessageResponse>('/removeCoupon', {
      couponDocumentId
    });
    return data;
  } catch (error: any) {
    console.error('Error removing coupon:', error);
    throw error;
  }
}

// Inserir cartões na compra
export async function insertCards(cards: string[] | Array<{cardId: string, value: number}>): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.post<ApiMessageResponse>('/insertCards', {
      cards
    });
    return data;
  } catch (error: any) {
    console.error('Error inserting cards:', error);
    throw error;
  }
}

// Inserir endereços na compra  
export async function insertAddresses(addresses: string[]): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.post<ApiMessageResponse>('/insertAddresses', {
      addresses
    });
    return data;
  } catch (error: any) {
    console.error('Error inserting addresses:', error);
    throw error;
  }
}

// Finalizar compra
export async function finalizePurchase(): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.post<ApiMessageResponse>('/endPurchase');
    return data;
  } catch (error: any) {
    console.error('Error finalizing purchase:', error);
    throw error;
  }
}