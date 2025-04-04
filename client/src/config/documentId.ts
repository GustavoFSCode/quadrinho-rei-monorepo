// src/config/documentId.ts
import { localStorageKeys } from '@/utils/localStorageKeys';
import api from '../services/api';

export async function getClientDocumentId(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const userData = localStorage.getItem(localStorageKeys.user);
  if (!userData) {
    return null;
  }

  let user;
  try {
    user = JSON.parse(userData);
  } catch (error) {
    console.error('Erro ao parsear o usuário do localStorage:', error);
    return null;
  }

  const userDocumentId = user.documentId;
  if (!userDocumentId) {
    return null;
  }

  try {
    const { data } = await api.get(`/getUser/${userDocumentId}`);
    return data.client.documentId;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return 'a';
  }
}

// Variável que será atualizada com o documentId
export let clientDocumentId: string;
getClientDocumentId().then(id => {
  clientDocumentId = id || '';
});
