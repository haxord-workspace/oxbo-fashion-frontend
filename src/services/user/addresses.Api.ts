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
};
