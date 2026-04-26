import { api } from './api';
import type { BorrowRecord } from '@/stores/borrowStore';

export const borrowService = {
  async getMyBorrows(): Promise<BorrowRecord[]> {
    const response = await api.get<BorrowRecord[] | { results: BorrowRecord[] }>('/api/borrower/');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.results ?? []);
  },
};
