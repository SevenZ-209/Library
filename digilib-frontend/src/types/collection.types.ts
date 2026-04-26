import type { Book } from './book.types';

export interface Collection {
  id: number;
  name: string;
  description: string;
  cover_image: string | null;
  book_count: number;
  curator_name: string;
  is_featured: boolean;
  created_date: string;
  updated_date: string;
  books?: CollectionBook[];
}

export interface CollectionBook {
  id: number;
  book_id: number;
  title: string;
  author: string;
  image: string | null;
  added_date?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
