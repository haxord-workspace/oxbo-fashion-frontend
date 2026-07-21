export interface Brand {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandsResponse {
  brands: Brand[];
  total: number;
  page: number;
  pages: number;
}
