export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  image?: string;
  parentCategory?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
