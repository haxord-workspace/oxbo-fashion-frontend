export interface User {
  _id?: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  pincode?: string;
  profileImage?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
}
