// src/services/productsApi.ts
import axiosInstance from "./axiosInstance";
import type { Product, ProductFilters, PaginatedResponse } from "../types";

export const productsApi = {
  getProducts: async (
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> => {
    const { data } = await axiosInstance.get("/products", { params: filters });
    return data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const { data } = await axiosInstance.get(`/products/${id}`);
    return data;
  },

  getProductVariants: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get(`/products/${id}/variants`);
    return data;
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const { data } = await axiosInstance.get(`/products/category/${category}`);
    return data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get("/products/featured");
    return data;
  },
};
