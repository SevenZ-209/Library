export interface Book {
  id: number;
  title: string;
  author: string;
  category: number;
  category_name: string;
  description: string;
  image: string | null;
  tags: string[];
  total_copies: number;
  available_copies: number;
  created_date: string;
  updated_date: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface BorrowRecord {
  id: number;
  borrower_name: string;
  borrower_phone: string;
  book_title: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'pending' | 'borrowed' | 'returned' | 'overdue' | 'cancelled';
  note: string;
  book_image?: string | null;
}

export interface DashboardStats {
  total_books: number;
  borrowed_books: number;
  overdue_books: number;
  active_users?: number;
  chart_data?: { name: string; borrows: number }[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
