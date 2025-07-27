//@/services/clientService
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

// Interface para o retorno paginado do getClient
export interface PaginatedClients {
  data: Client[];
  totalCount: number;
  page: string;
  pageSize: string;
}

// Interfaces para os payloads
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

export interface UserWithClient extends User {
  client: Client;
}

export async function getClient(
  documentId?: string,
  page?: number,
  pageSize?: number,
  filter?: string
): Promise<PaginatedClients> {
  const params: any = {};
  if (documentId) params.id = documentId;
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;
  if (filter) params.filter = filter;

  const { data } = await api.get('/getClient', { params });
  return data;
}

export async function createClient(payload: CreateClientPayload): Promise<Client> {
  const { data } = await api.post('/createClient', payload);
  return data;
}

export async function createCard(
  clientDocumentId: string,
  payload: { card: CreateCardPayload }
): Promise<Card> {
  const { data } = await api.post(`/createCard/${clientDocumentId}`, payload);
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

export async function changePassword(userDocumentId: string, newPassword: string): Promise<any> {
  const { data } = await api.put(`/changePassword/${userDocumentId}`, { password: newPassword });
  return data;
}

export async function editClient(
  clientDocumentId: string,
  payload: {
    clientEdit: {
      client: {
        name: string;
        birthDate: string;
        gender: string;
        cpf: string;
        phone: string;
        typePhone: string;
        ranking: number;
      };
      user: {
        username: string;
        email: string;
      };
    };
  }
): Promise<Client> {
  const { data } = await api.put(`/editClient/${clientDocumentId}`, payload);
  return data;
}

export async function editCard(cardDocumentId: string, isFavorite: boolean): Promise<Card> {
  const { data } = await api.put(`/editCard/${cardDocumentId}`, { isFavorite });
  return data;
}

export async function deleteCard(cardDocumentId: string): Promise<any> {
  const { data } = await api.delete(`/deleteCard/${cardDocumentId}`);
  return data;
}

export async function deleteAddress(addressDocumentId: string): Promise<any> {
  const { data } = await api.delete(`/deleteAddress/${addressDocumentId}`);
  return data;
}

export async function editAddress(
  addressDocumentId: string,
  payload: { address: CreateAddressPayload }
): Promise<Address> {
  const { data } = await api.put(`/editAddress/${addressDocumentId}`, payload);
  return data;
}

export async function createAddress(
  clientDocumentId: string,
  payload: { address: CreateAddressPayload }
): Promise<Address> {
  const { data } = await api.post(`/createAddress/${clientDocumentId}`, payload);
  return data;
}

export async function getUser(
  userDocumentId: string
): Promise<UserWithClient> {
  const { data } = await api.get<UserWithClient>(
    `/getUser/${userDocumentId}`
  );
  return data;
}
