import { api } from './api';
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/token/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/api/user/', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/user/current-user/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/api/user/current-user/', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
