import { useState, useEffect, useCallback } from 'react';
import { BookCard } from '@/components/books/BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { bookService } from '@/services/book.service';
import { categoryService } from '@/services/category.service';
import type { Book, Category } from '@/types/book.types';
import '@/styles/view-transitions.css';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchData = useCallback(async () => {
    try {
      const [booksData, trendingData, catsData] = await Promise.all([
        bookService.getBooks({
          q: debouncedSearch || undefined,
          category_id: selectedCategory || undefined,
        }),
        bookService.getBooks({ ordering: 'popular' }),
        categoryService.getCategories(),
      ]);
      setBooks(booksData.results);
      setTrendingBooks(trendingData.results.slice(0, 10)); // Display top 10
      setCategories(catsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [selectedCategory, debouncedSearch]);

  const fetchDataWithLoading = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
    setIsLoading(false);
  }, [fetchData]);

  useEffect(() => {
    fetchDataWithLoading();
  }, [fetchDataWithLoading]);

  // Stagger animation for hero section
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-slide-up');
    elements.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${i * 100}ms`;
    });
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Search Section */}
      <section className="mb-16 flex flex-col items-center text-center max-w-4xl mx-auto px-8">
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-tight animate-slide-up">
          Khám phá{' '}
          <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Thư Viện Số
          </span>
        </h1>

        {/* Search Input */}
        <div className="w-full relative group animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-16 pr-6 bg-surface-container-highest border-none rounded-full text-lg font-[family-name:var(--font-body)] focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder:text-outline/60"
            placeholder="Tìm kiếm sách, tác giả..."
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap justify-center gap-3 mt-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {categories.length === 0 && !isLoading ? (
            <>
              {['Tất cả', 'Tiểu thuyết', 'Khoa học', 'Lịch sử', 'Triết học', 'Văn học'].map((label) => (
                <button
                  key={label}
                  className="px-5 py-2 rounded-full bg-secondary-container text-on-secondary-container font-[family-name:var(--font-label)] text-sm font-medium hover:bg-surface-container-highest transition-all"
                >
                  {label}
                </button>
              ))}
            </>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2 rounded-full font-[family-name:var(--font-label)] text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2 rounded-full font-[family-name:var(--font-label)] text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Books Carousel */}
      {!searchQuery && selectedCategory === null && trendingBooks.length > 0 && (
        <section className="mb-16 px-8 max-w-screen-2xl mx-auto animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-3xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">local_fire_department</span>
              Sách Thịnh Hành
            </h2>
          </div>
          
          <div className="relative group/carousel">
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {trendingBooks.map((book, index) => (
                <div key={book.id} className="min-w-[280px] md:min-w-[320px] snap-start shrink-0">
                  <BookCard book={book} index={index} />
                </div>
              ))}
            </div>
            {/* Custom CSS to hide scrollbar while keeping functionality */}
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </section>
      )}

      {/* Book Grid */}
      <section className="px-8 pb-20 max-w-screen-2xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">menu_book</span>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
              Không tìm thấy sách
            </h3>
            <p className="text-on-surface-variant">
              {searchQuery
                ? `Không có kết quả cho "${searchQuery}"`
                : 'Chưa có sách nào trong danh mục này.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {books.length >= 8 && (
          <nav aria-label="Library pagination" className="mt-20 flex justify-center items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-30"
              disabled
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex gap-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold font-[family-name:var(--font-label)] transition-colors ${
                    page === 1
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="w-10 h-10 flex items-center justify-center text-outline">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface font-[family-name:var(--font-label)]">
                12
              </button>
            </div>
            <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface active:scale-95">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
