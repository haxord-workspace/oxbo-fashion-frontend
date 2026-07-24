export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  image?: string;
  parentCategory?: string | null;
  suggestions?: { title: string; description: string }[];
  createdAt?: string;
  updatedAt?: string;
  subCategoryCount?: number;
  productCount?: number;
  totalSubCategories?: number;
  totalProducts?: number;
  children?: Category[];
}
