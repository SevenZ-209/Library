import { create } from 'zustand';
import { borrowService } from '../services/borrow.service';

export interface BorrowRecord {
  id: number;
  borrower_name: string;
  borrower_phone: string;
  book_title: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'pending' | 'borrowed' | 'returned' | 'overdue' | 'cancelled';
  note: string | null;
  book_id?: number;
}

interface BorrowState {
  records: BorrowRecord[];
  isLoading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
}

export const useBorrowStore = create<BorrowState>()((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await borrowService.getMyBorrows();
      set({ records: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch borrow records', isLoading: false });
      console.error('Failed to fetch borrow records:', error);
    }
  },
}));
