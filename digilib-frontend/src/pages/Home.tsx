import { useState, useEffect, useCallback, useRef } from 'react';
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
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300; 
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [booksData, trendingData, catsData] = await Promise.all([
        bookService.getBooks({
          q: debouncedSearch || undefined,
          category_id: selectedCategory || undefined,
          page: currentPage,
        }),
        bookService.getBooks({ ordering: 'popular' }),
        categoryService.getCategories(),
      ]);

      setBooks(booksData.results || []);
      setTrendingBooks(trendingData.results?.slice(0, 10) || []); 
      setCategories(catsData);

      const totalItems = booksData.count || 0;
      setTotalPages(Math.ceil(totalItems / 8)); 

    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [selectedCategory, debouncedSearch, currentPage]);

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
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">local_fire_department</span>
              Sách Thịnh Hành
            </h2>
            
            {/* Cụm nút điều hướng Slide (Chỉ hiện trên màn hình máy tính) */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => scrollCarousel('left')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all text-on-surface-variant shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all text-on-surface-variant shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
              </button>
            </div>
          </div>
          
          <div className="relative group/carousel">
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {trendingBooks.map((book, index) => (
                <div key={book.id} className="w-[160px] sm:w-[200px] md:w-[240px] snap-start shrink-0">
                  <BookCard book={book} index={index} />
                </div>
              ))}
            </div>

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

        {/* Pagination THẬT */}
        {totalPages > 1 && (
          <nav aria-label="Library pagination" className="mt-20 flex justify-center items-center gap-2">
            
            {/* Nút Lùi */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-30 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {/* Danh sách số trang */}
            <div className="flex gap-1">
              {(() => {
                // Logic tính toán hiển thị các trang (hiện trang đầu, trang cuối, và các trang quanh trang hiện tại)
                const pages = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    pages.push(i);
                  }
                }
                const finalPages = [];
                let lastAdded = 0;
                for (let page of pages) {
                  if (lastAdded > 0 && page - lastAdded > 1) {
                    finalPages.push('...');
                  }
                  finalPages.push(page);
                  lastAdded = page;
                }

                return finalPages.map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-outline font-bold">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold font-[family-name:var(--font-label)] transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-primary text-on-primary shadow-md'
                          : 'hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ));
              })()}
            </div>

            {/* Nút Tiến */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-30 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

          </nav>
        )}
      </section>
    </div>
  );
}
