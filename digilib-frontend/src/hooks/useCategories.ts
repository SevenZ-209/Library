import { useState, useEffect } from 'react';
import { categoryService } from '@/services/category.service';
import type { Category } from '@/types/book.types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to fetch categories:', err))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
