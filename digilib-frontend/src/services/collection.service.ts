import { api } from './api';
import type { Collection, PaginatedResponse } from '@/types/collection.types';

export const collectionService = {
  async getCollections(params?: {
    q?: string;
    page?: number;
  }): Promise<PaginatedResponse<Collection>> {
    const response = await api.get<PaginatedResponse<Collection>>('/api/collection/', { params });
    return response.data;
  },

  async getCollection(id: number): Promise<Collection> {
    const response = await api.get<Collection>(`/api/collection/${id}/`);
    return response.data;
  },

  async getFeaturedCollections(): Promise<Collection[]> {
    const response = await api.get<Collection[] | { results: Collection[] }>('/api/collection/featured/');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.results ?? []);
  },

  async createCollection(data: { name: string; description: string }): Promise<Collection> {
    const response = await api.post<Collection>('/api/collection/', data);
    return response.data;
  },

  async addBookToCollection(collectionId: number, bookId: number): Promise<void> {
    await api.post(`/api/collection/${collectionId}/add-book/`, { book_id: bookId });
  },
};
