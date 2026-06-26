// src/services/authApi.ts
import axiosInstance from "./axiosInstance";
import type { User } from "../types";

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post("/auth/login", credentials);
    return data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post("/auth/register", payload);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await axiosInstance.get("/auth/me");
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },
};
