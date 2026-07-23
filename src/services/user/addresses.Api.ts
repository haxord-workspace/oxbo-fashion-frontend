import api from '../api';
import type { UserAddress } from '../../types/address';

export const userAddressesApi = {
  getAddresses: async (): Promise<{ data: UserAddress[] }> => {
    const response = await api.get('/addresses');
    return response.data;
  },
  addAddress: async (data: UserAddress): Promise<{ data: UserAddress }> => {
    const response = await api.post('/addresses', data);
    return response.data;
  },
  updateAddress: async (id: string, data: Partial<UserAddress>): Promise<{ data: UserAddress }> => {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },
  deleteAddress: async (id: string): Promise<void> => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
};
