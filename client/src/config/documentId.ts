// src/config/documentId.ts
import { localStorageKeys } from '@/utils/localStorageKeys';

export const documentId = (() => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(localStorageKeys.user);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.documentId;
      } catch (error) {
        console.error('Erro ao parsear o usuário do localStorage:', error);
      }
    }
  }
  return null;
})();
