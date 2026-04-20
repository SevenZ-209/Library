import type { Book } from '@/types/book.types';
import { BookCard } from './BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
  selectedCategory: number | null;
  categories: { id: number; name: string }[];
  onCategoryChange: (id: number | null) => void;
}

export function BookGrid({
  books,
  isLoading,
  selectedCategory,
}: BookGridProps) {
  const filteredBooks = selectedCategory
    ? books.filter((b) => b.category === selectedCategory)
    : books;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredBooks.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon="menu_book"
        title="No books found"
        description="Try selecting a different category or adjusting your search."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {filteredBooks.map((book, index) => (
        <BookCard key={book.id} book={book} index={index} />
      ))}
    </div>
  );
}
