import { api } from './api';
import type { Book, PaginatedResponse, BorrowRecord, DashboardStats } from '@/types/book.types';

export const bookService = {
  async getBooks(params?: {
    q?: string;
    category_id?: number;
    is_available?: boolean;
    author?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<Book>> {
    const response = await api.get<PaginatedResponse<Book>>('/api/book/', { params });
    return response.data;
  },

  async getBook(id: number): Promise<Book> {
    const response = await api.get<Book>(`/api/book/${id}/`);
    return response.data;
  },

  async getBorrowHistory(bookId: number): Promise<BorrowRecord[]> {
    const response = await api.get<BorrowRecord[]>(`/api/book/${bookId}/borrow-history/`);
    return response.data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/api/book/dashboard-stats/');
    return response.data;
  },

  async createBook(formData: FormData): Promise<Book> {
    const response = await api.post<Book>('/api/book/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateBook(id: number, data: Partial<Book>): Promise<Book> {
    const response = await api.patch<Book>(`/api/book/${id}/`, data);
    return response.data;
  },

  async deleteBook(id: number): Promise<void> {
    await api.delete(`/api/book/${id}/`);
  },

  async borrowBook(bookId: number): Promise<void> {
    await api.post(`/api/borrower/`, { book_id: bookId });
  },

  async getAllBorrowRecords(): Promise<PaginatedResponse<BorrowRecord>> {
    const response = await api.get<PaginatedResponse<BorrowRecord>>('/api/borrower/');
    return response.data;
  },

  async confirmPickup(recordId: number): Promise<void> {
    await api.post(`/api/borrower/${recordId}/confirm-pickup/`);
  },

  async returnBook(recordId: number): Promise<void> {
    await api.post(`/api/borrower/${recordId}/return/`);
  },
};
