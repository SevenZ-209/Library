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

  async createCollection(data: FormData): Promise<Collection> {
    const response = await api.post<Collection>('/api/collection/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async addBookToCollection(collectionId: number, bookId: number): Promise<void> {
    await api.post(`/api/collection/${collectionId}/add-book/`, { book_id: bookId });
  },

  async updateCollection(id: number, data: FormData): Promise<Collection> {
    const response = await api.patch<Collection>(`/api/collection/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async removeBookFromCollection(collectionId: number, bookId: number): Promise<void> {
    await api.post(`/api/collection/${collectionId}/remove-book/`, { book_id: bookId });
  },
};
