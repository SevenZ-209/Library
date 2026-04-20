import { create } from 'zustand';
import type { Book, Category } from '@/types/book.types';

interface BookState {
  books: Book[];
  categories: Category[];
  selectedCategory: number | null;
  searchQuery: string;
  isLoading: boolean;
  currentPage: number;
  totalCount: number;
  setBooks: (books: Book[]) => void;
  setCategories: (categories: Category[]) => void;
  setSelectedCategory: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setPage: (page: number) => void;
  setTotalCount: (count: number) => void;
}

export const useBookStore = create<BookState>()((set) => ({
  books: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,
  currentPage: 1,
  totalCount: 0,

  setBooks: (books) => set({ books }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (id) => set({ selectedCategory: id, currentPage: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setLoading: (loading) => set({ isLoading: loading }),
  setPage: (page) => set({ currentPage: page }),
  setTotalCount: (count) => set({ totalCount: count }),
}));
