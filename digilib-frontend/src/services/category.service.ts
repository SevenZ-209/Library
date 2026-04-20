import { api } from './api';
import type { Category } from '@/types/book.types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/api/category/');
    return response.data;
  },
};
