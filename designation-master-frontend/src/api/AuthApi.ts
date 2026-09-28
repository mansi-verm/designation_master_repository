
import axiosInstance from "./axiosInstance";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  error?: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    data,
  );

  return response.data.data;
};