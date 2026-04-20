import { Link } from 'react-router-dom';
import type { Book } from '@/types/book.types';
import { Badge } from '@/components/ui/Badge';
import { getAvailabilityStatus } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  index?: number;
}

export function BookCard({ book, index = 0 }: BookCardProps) {
  const status = getAvailabilityStatus(book.available_copies, book.total_copies);

  const statusConfig = {
    available: { label: 'Còn sách', dot: 'bg-primary' },
    limited: { label: 'Hạn chế', dot: 'bg-amber-500' },
    unavailable: { label: 'Đã mượn', dot: 'bg-outline' },
  };

  const { label, dot } = statusConfig[status];

  return (
    <article
      className="group bg-surface-container-lowest rounded-xl p-4 transition-all duration-500 hover:scale-[1.02] flex flex-col h-full"
      style={{
        animationDelay: `${index * 80}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Cover Image */}
      <Link
        to={`/book/${book.id}`}
        className="block"
        style={{ viewTransitionName: `book-cover-${book.id}` }}
      >
        <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-surface-container relative">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-container/10">
              <span className="material-symbols-outlined text-5xl text-primary/30">
                menu_book
              </span>
            </div>
          )}

          {/* Status dot */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-surface/80 backdrop-blur-sm rounded-full">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface font-[family-name:var(--font-label)]">
              {label}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="default" size="sm">
            {book.category_name}
          </Badge>
        </div>

        <h3 className="font-headline font-bold text-lg leading-tight text-on-surface group-hover:text-primary transition-colors line-clamp-2">
          {book.title}
        </h3>
        <p className="text-on-surface-variant/70 text-sm font-[family-name:var(--font-body)] mt-1 line-clamp-1">
          {book.author}
        </p>
      </div>

      {/* Action Button */}
      <Link to={`/book/${book.id}`}>
        <button className="mt-4 w-full py-3 rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all duration-300 font-[family-name:var(--font-label)] text-sm font-semibold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg">import_contacts</span>
          {book.available_copies > 0 ? 'Đọc ngay' : 'Thông báo tôi'}
        </button>
      </Link>
    </article>
  );
}
