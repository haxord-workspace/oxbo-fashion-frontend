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
  role?: string;
  roleId?: {
    _id: string;
    name: string;
  };
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
}
