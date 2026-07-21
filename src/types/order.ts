export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  _id?: string;
  id?: string;
  orderId?: string;
  totalAmount?: number;
  status?: string;
  shippingAddress?: Address;
  paymentMethod?: string;
  createdAt?: string;
}
