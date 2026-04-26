import { api } from './api';
import type { Category } from '@/types/book.types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[] | { results: Category[] }>('/api/category/');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.results ?? []);
  },
  async createCategory(name: string): Promise<Category> {
    const response = await api.post<Category>('/api/category/', { name });
    return response.data;
  },
};
