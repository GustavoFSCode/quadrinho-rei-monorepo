import api from './api';

export interface DashboardSalesData {
  yearMonth: string; // formato 'YYYY-MM'
  categories: {
    [categoryName: string]: number; // nome da categoria -> quantidade vendida
  };
}

export interface ProductCategory {
  id: number;
  documentId: string;
  name: string;
}

export interface DashboardFilters {
  category?: string;
  date1?: string; // formato 'YYYY-MM-DD'
  date2?: string; // formato 'YYYY-MM-DD'
}

export async function getDashboardSales(filters?: DashboardFilters): Promise<DashboardSalesData[]> {
  try {
    const params: any = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.date1) params.date1 = filters.date1;
    if (filters?.date2) params.date2 = filters.date2;

    const { data } = await api.get<DashboardSalesData[]>('/getDashboard', { params });
    return data;
  } catch (error: any) {
    console.error('Error fetching dashboard sales:', error);
    throw error;
  }
}

export async function getDashboardCategories(): Promise<ProductCategory[]> {
  try {
    const response = await api.get<{ data: ProductCategory[] }>('/getProductCategories');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching dashboard categories:', error);
    throw error;
  }
}