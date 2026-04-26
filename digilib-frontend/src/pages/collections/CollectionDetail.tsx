import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collectionService } from '@/services/collection.service';
import { BookCard } from '@/components/books/BookCard';
import { getImageUrl, formatDate } from '@/lib/utils';
import type { Collection, CollectionBook } from '@/types/collection.types';
import '@/styles/view-transitions.css';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [books, setBooks] = useState<CollectionBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const collectionId = parseInt(id);
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await collectionService.getCollection(collectionId);
        setCollection(data);
        setBooks(data.books || []);
      } catch {
        console.error('Failed to fetch collection');
        setCollection(null);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 pt-32 pb-20">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4 lg:col-span-3">
            <div className="aspect-[2/3] bg-surface-container rounded-xl animate-pulse" />
          </div>
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <div className="h-4 w-24 bg-surface-container rounded-full" />
            <div className="h-10 w-3/4 bg-surface-container rounded" />
            <div className="h-6 w-1/2 bg-surface-container rounded" />
            <div className="h-4 w-full bg-surface-container rounded" />
            <div className="h-4 w-2/3 bg-surface-container rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 pt-32 text-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">collections_bookmark</span>
        <h2 className="text-2xl font-headline font-bold">Không tìm thấy bộ sưu tập</h2>
        <p className="text-on-surface-variant mt-2">Bộ sưu tập này có thể đã bị xóa.</p>
        <button 
          onClick={() => navigate('/collections')} 
          className="mt-6 px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Quay lại Bộ sưu tập
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-8 pt-28 pb-32">
      {/* Hero Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-start mb-20">
        {/* Left: Collection Cover - Sticky */}
        <div className="md:col-span-5 lg:col-span-4">
          <div className="sticky top-28">
            <div
              className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,104,95,0.15)] group"
              style={{ viewTransitionName: `collection-${collection.id}` }}
            >
              {collection.cover_image ? (
                <img
                  src={getImageUrl(collection.cover_image)}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-8xl text-primary/40 mb-2">collections_bookmark</span>
                    <p className="text-sm text-on-surface-variant">Collection Cover</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>


          </div>
        </div>

        {/* Right: Collection Info */}
        <div className="md:col-span-7 lg:col-span-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/collections')}
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-semibold font-[family-name:var(--font-label)]">Quay lại Bộ sưu tập</span>
          </button>

          {/* Title & Description */}
          <div className="mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6 leading-tight">
              {collection.name}
            </h1>

            <p className="font-[family-name:var(--font-body)] text-lg text-on-surface-variant leading-relaxed">
              {collection.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-outline-variant/30 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-[family-name:var(--font-label)]">Curator</p>
                <p className="font-semibold text-on-surface">{collection.curator_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">library_books</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-[family-name:var(--font-label)]">Items</p>
                <p className="font-semibold text-on-surface">{collection.book_count} cuốn sách</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">update</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-[family-name:var(--font-label)]">Cập nhật</p>
                <p className="font-semibold text-on-surface">{formatDate(collection.updated_date)}</p>
              </div>
            </div>
          </div>

          {/* Tags preview */}
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-bold text-on-surface">Nội dung bộ sưu tập</h3>
            <div className="flex flex-wrap gap-2">
              {['Triết học', 'Lịch sử', 'Văn hóa', 'Nghệ thuật', 'Khoa học'].map((tag) => (
                <span 
                  key={tag}
                  className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant font-[family-name:var(--font-label)] text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Books in Collection */}
      <section className="pt-8 border-t border-outline-variant/20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">menu_book</span>
              Sách trong bộ sưu tập
            </h2>
            <p className="text-on-surface-variant mt-1 font-[family-name:var(--font-label)]">
              {collection.book_count} cuốn sách được tuyển chọn
            </p>
          </div>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((cb, index) => (
              <BookCardFromCollection key={cb.id} book={cb} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">auto_stories</span>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
              Danh sách sách sẽ sớm được cập nhật
            </h3>
            <p className="text-on-surface-variant">
              Các cuốn sách trong bộ sưu tập này đang được chuẩn bị.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// Component để hiển thị sách từ collection (sử dụng CollectionBook type)
function BookCardFromCollection({ book, index = 0 }: { book: CollectionBook; index?: number }) {
  return (
    <article
      className="group bg-surface-container-lowest rounded-xl p-4 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 flex flex-col h-full"
      style={{
        animationDelay: `${index * 80}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Cover Image */}
      <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-surface-container relative">
        {book.image ? (
          <img
            src={getImageUrl(book.image)}
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
      </div>

      {/* Content */}
      <div className="flex-grow">
        <h3 className="font-headline font-bold text-lg leading-tight text-on-surface group-hover:text-primary transition-colors line-clamp-2">
          {book.title}
        </h3>
        <p className="text-on-surface-variant/70 text-sm font-[family-name:var(--font-body)] mt-1 line-clamp-1">
          {book.author}
        </p>
      </div>

      {/* Action Button */}
      <Link 
        to={`/book/${book.book_id}`}
        className="mt-4 w-full py-3 rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all duration-300 font-[family-name:var(--font-label)] text-sm font-semibold flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">visibility</span>
        Xem chi tiết
      </Link>
    </article>
  );
}
