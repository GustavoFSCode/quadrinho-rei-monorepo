import api from './api';

// Interfaces para os dados retornados pela API
export interface Address {
  id: number;
  documentId: string;
  nameAddress: string;
  TypeAddress: string;
  typeLogradouro: string;
  nameLogradouro: string;
  number: string;
  neighborhood: string;
  cep: string;
  city: string;
  state: string;
  country: string;
  observation: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface Card {
  id: number;
  documentId: string;
  holderName: string;
  numberCard: string;
  flagCard: string;
  safeNumber: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  password: string;
  resetPasswordToken: string | null;
  confirmationToken: string | null;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface Client {
  id: number;
  documentId: string;
  name: string;
  birthDate: string;
  gender: string;
  cpf: string;
  phone: string;
  typePhone: string;
  ranking: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  addresses: Address[];
  cards: Card[];
  user: User;
}

// Interfaces para o payload de criação do cliente
export interface CreateAddressPayload {
  nameAddress: string;
  TypeAddress: string;
  typeLogradouro: string;
  nameLogradouro: string;
  number: string;
  neighborhood: string;
  cep: string;
  city: string;
  state: string;
  country: string;
  observation: string;
}

export interface CreateCardPayload {
  holderName: string;
  numberCard: string;
  flagCard: string;
  safeNumber: string;
  isFavorite: boolean;
}

export interface CreateClientPayload {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  gender: string;
  cpf: string;
  phone: string;
  typePhone: string;
  ranking: number;
  Address: CreateAddressPayload[];
  Card: CreateCardPayload[];
}

// Função GET para buscar os clientes
export async function getClient(documentId?: string): Promise<Client[]> {
  const { data } = await api.get('/getClient', {
    params: { id: documentId }
  });
  return data;
}


// Função POST para criar um novo cliente
export async function createClient(payload: CreateClientPayload): Promise<Client> {
  const { data } = await api.post('/createClient', payload);
  return data;
}

export async function deleteUser(userDocumentId: string): Promise<any> {
  const { data } = await api.delete(`/deleteUser/${userDocumentId}`);
  return data;
}

export async function blockUser(userDocumentId: string): Promise<any> {
  const { data } = await api.put(`/blockUser/${userDocumentId}`);
  return data;
}
