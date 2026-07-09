export interface StoreAddress {
  addressLine1: string;
  city: string;
}

export interface Store {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  type: string;
  status?: string;
  address: StoreAddress;
  createdAt?: string;
}
