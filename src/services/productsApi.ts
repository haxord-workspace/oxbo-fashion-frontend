// src/services/productsApi.ts
import api from "./api";
import type { Product, ProductFilters, PaginatedResponse } from "../types";

export const productsApi = {
  getProducts: async (
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get("/products", { params: filters });
    return data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  getProductVariants: async (id: string): Promise<any> => {
    const { data } = await api.get(`/products/${id}/variants`);
    return data;
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const { data } = await api.get(`/products/category/${category}`);
    return data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const { data } = await api.get("/products/featured");
    return data;
  },
};
