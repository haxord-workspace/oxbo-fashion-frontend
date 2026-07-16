// src/services/ordersApi.ts
import axiosInstance from "./axiosInstance";
import type { Order, Address } from "../types";

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    const { data } = await axiosInstance.get("/orders");
    return data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await axiosInstance.get(`/orders/${id}`);
    return data;
  },

  placeOrder: async (payload: {
    shippingAddress: Address;
    paymentMethod: "cod" | "online";
  }): Promise<Order> => {
    const { data } = await axiosInstance.post("/orders", payload);
    return data;
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const { data } = await axiosInstance.patch(`/orders/${id}/cancel`);
    return data;
  },
};
