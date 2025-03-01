import api from './api';

export async function getClient() {
  const { data } = await api.get('/getClient');
  return data;
}
