// src/services/authService.ts
import api from './api';

export interface ILoginResponse {
  jwt: string;
  refreshToken?: string;
  user: {
    id: number;
    username: string;
    email: string;
    [key: string]: any;
  };
}

/**
 * Faz login no Strapi usando a rota /auth/local
 * @param identifier email do usuário
 * @param password senha do usuário
 * @returns { jwt, refreshToken?, user }
 */
export async function login(identifier: string, password: string): Promise<ILoginResponse> {
  const response = await api.post<ILoginResponse>('/auth/local', {
    identifier,
    password,
  });
  return response.data;
}
