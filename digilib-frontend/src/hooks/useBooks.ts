import { useState, useEffect } from 'react';
import { bookService } from '@/services/book.service';
import type { Book } from '@/types/book.types';
import { useBookStore } from '@/stores/bookStore';

export function useBooks() {
  const { books, isLoading, setBooks, setLoading } = useBookStore();

  const fetchBooks = async (params?: {
    q?: string;
    category_id?: number;
    page?: number;
  }) => {
    setLoading(true);
    try {
      const data = await bookService.getBooks(params);
      setBooks(data.results);
      return data;
    } catch (err) {
      console.error('Failed to fetch books:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { books, isLoading, fetchBooks };
}

export function useBook(id: number) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const data = await bookService.getBook(id);
        setBook(data);
      } catch {
        setError('Không tìm thấy sách');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  return { book, loading, error };
}
