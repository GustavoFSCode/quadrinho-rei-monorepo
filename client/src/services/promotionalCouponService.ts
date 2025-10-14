import api from './api';

export interface PromotionalCoupon {
  id: number;
  documentId: string;
  code: string;
  title: string;
  price: number;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CouponUsage {
  id: number;
  documentId: string;
  clientName: string;
  clientUsageCount: number;
  purchaseId: string;
  totalValue: number;
  date: string;
}

export interface CouponUsagesResponse {
  coupon: {
    code: string;
    title: string;
    usageCount: number;
    usageLimit: number;
    totalUniqueClients: number;
  };
  usages: CouponUsage[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface PromotionalCouponsResponse {
  data: PromotionalCoupon[];
  pagination: PaginationMeta;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Criar cupom promocional
 */
export async function createPromotionalCoupon(couponData: {
  title: string;
  usageLimit: number;
  price: number;
}): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.post<ApiMessageResponse>('/createPromotionalCoupon', couponData);
    return data;
  } catch (error: any) {
    console.error('Error creating promotional coupon:', error);
    throw error;
  }
}

/**
 * Listar cupons promocionais
 */
export async function getPromotionalCoupons(
  page?: number,
  pageSize?: number
): Promise<PromotionalCoupon[] | PromotionalCouponsResponse> {
  try {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (pageSize !== undefined) params.pageSize = pageSize;

    const { data } = await api.get<PromotionalCoupon[] | PromotionalCouponsResponse>(
      '/getPromotionalCoupons',
      { params }
    );
    return data;
  } catch (error: any) {
    console.error('Error fetching promotional coupons:', error);
    throw error;
  }
}

/**
 * Obter usos de um cupom específico
 */
export async function getCouponUsages(code: string): Promise<CouponUsagesResponse> {
  try {
    const { data } = await api.get<CouponUsagesResponse>(`/getCouponUsages/${code}`);
    return data;
  } catch (error: any) {
    console.error('Error fetching coupon usages:', error);
    throw error;
  }
}

/**
 * Alternar status ativo/inativo do cupom
 */
export async function toggleCouponStatus(
  id: string,
  isActive: boolean
): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.put<ApiMessageResponse>(`/toggleCouponStatus/${id}`, {
      isActive
    });
    return data;
  } catch (error: any) {
    console.error('Error toggling coupon status:', error);
    throw error;
  }
}

/**
 * Deletar cupom promocional
 */
export async function deletePromotionalCoupon(id: string): Promise<ApiMessageResponse> {
  try {
    const { data } = await api.delete<ApiMessageResponse>(`/deletePromotionalCoupon/${id}`);
    return data;
  } catch (error: any) {
    console.error('Error deleting promotional coupon:', error);
    throw error;
  }
}
