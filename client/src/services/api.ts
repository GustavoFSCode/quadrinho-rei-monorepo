/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios';
import { localStorageKeys } from '@/utils/localStorageKeys';

export const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  async config => {
    const accessToken =
      localStorage.getItem(localStorageKeys.accessToken) ||
      sessionStorage.getItem(localStorageKeys.accessToken);

    if (
      accessToken &&
      config.url !== '/auth/refresh-token' &&
      config.url !== '/auth/local'
    ) {
      config.headers!.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);


export default api;

export async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem(localStorageKeys.refreshToken);

    if (typeof refreshToken === 'string') {
      const { data } = await api.post('/auth/refresh-token', {
        refreshToken: refreshToken,
      });
      localStorage.setItem(localStorageKeys.accessToken, data.jwt);
      localStorage.setItem(localStorageKeys.refreshToken, data.refreshToken);

      return data?.jwt;
    } else {
      // Se não houver refreshToken, redirecionar para o login
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  } catch (error) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }
}


api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest.retry &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest.retry = true;
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  },
);
