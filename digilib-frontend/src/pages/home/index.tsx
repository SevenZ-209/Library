import { useState, useEffect, useCallback, useRef } from 'react';
import { BookCard } from '@/components/books/BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { bookService } from '@/services/book.service';
import { categoryService } from '@/services/category.service';
import type { Book, Category } from '@/types/book.types';
import styles from './Home.module.css';

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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const CATEGORY_LIMIT = 5;

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
    <div className={styles.pageWrapper}>
      {/* Hero Search Section */}
      <section className={styles.heroSection}>
        <h1 className={`${styles.heroTitle} bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent`}>
          Khám phá{' '}
          <span>DigiLib</span>
        </h1>

        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            placeholder="Tìm kiếm sách, tác giả..."
          />
        </div>

        {/* Category Chips - Horizontal Scroll with Limit & Expand */}
        <div className={styles.categorySection}>
          <div className={styles.categoryContainer}>
            {/* Gradient fade left */}
            <div className={styles.fadeLeft} />
            
            {/* Gradient fade right */}
            <div className={styles.fadeRight} />
            
            {/* Nút scroll trái */}
            <button
              onClick={() => {
                const container = document.getElementById('category-scroll');
                container?.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
              id="scroll-left-btn"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            
            {/* Nút scroll phải */}
            <button
              onClick={() => {
                const container = document.getElementById('category-scroll');
                container?.scrollBy({ left: 200, behavior: 'smooth' });
              }}
              className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
              id="scroll-right-btn"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>

            {/* Scrollable container */}
            <div
              id="category-scroll"
              className={styles.categoryScroll}
              onScroll={(e) => {
                const target = e.currentTarget;
                const leftBtn = document.getElementById('scroll-left-btn');
                const rightBtn = document.getElementById('scroll-right-btn');
                if (leftBtn) {
                  leftBtn.style.opacity = target.scrollLeft > 10 ? '1' : '0';
                  leftBtn.style.pointerEvents = target.scrollLeft > 10 ? 'auto' : 'none';
                }
                if (rightBtn) {
                  rightBtn.style.opacity = target.scrollLeft < target.scrollWidth - target.clientWidth - 10 ? '1' : '0';
                  rightBtn.style.pointerEvents = target.scrollLeft < target.scrollWidth - target.clientWidth - 10 ? 'auto' : 'none';
                }
              }}
            >
              {categories.length === 0 && !isLoading ? (
                <>
                  {['Tất cả', 'Tiểu thuyết', 'Khoa học', 'Lịch sử', 'Triết học', 'Văn học'].map((label) => (
                    <button
                      key={label}
                      className={styles.categoryChip}
                    >
                      {label}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`${styles.categoryChip} ${
                      selectedCategory === null ? styles.categoryChipActive : styles.categoryChipInactive
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories
                    .slice(0, showCategoryModal ? undefined : CATEGORY_LIMIT)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`${styles.categoryChip} ${
                          selectedCategory === cat.id ? styles.categoryChipActive : styles.categoryChipInactive
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  {categories.length > CATEGORY_LIMIT && (
                    <button
                      onClick={() => {
                        setModalSearchQuery('');
                        setShowCategoryModal(true);
                      }}
                      className={styles.expandButton}
                    >
                      <span>Xem thêm</span>
                      <span className={cn("material-symbols-outlined", styles.expandIcon)}>expand_more</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Books Carousel */}
      {!searchQuery && selectedCategory === null && trendingBooks.length > 0 && (
        <section className={styles.trendingSection} style={{ animationDelay: '300ms' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={cn("material-symbols-outlined", styles.sectionIcon)}>local_fire_department</span>
              Sách Thịnh Hành
            </h2>
            
            {/* Cụm nút điều hướng Slide (Chỉ hiện trên màn hình máy tính) */}
            <div className={styles.carouselNavButtons}>
              <button 
                onClick={() => scrollCarousel('left')}
                className={styles.navButton}
              >
                <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                className={styles.navButton}
              >
                <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
              </button>
            </div>
          </div>
          
          <div className={styles.carousel}>
            <div 
              ref={carouselRef}
              className={styles.carouselTrack}
            >
              {trendingBooks.map((book, index) => (
                <div key={book.id} className={styles.carouselItem}>
                  <BookCard book={book} index={index} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Book Grid */}
      <section className={styles.bookSection}>
        {isLoading ? (
          <div className={styles.bookGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={cn("material-symbols-outlined", styles.emptyIcon)}>menu_book</span>
            <h3 className={styles.emptyTitle}>
              Không tìm thấy sách
            </h3>
            <p className={styles.emptyText}>
              {searchQuery
                ? `Không có kết quả cho "${searchQuery}"`
                : 'Chưa có sách nào trong danh mục này.'}
            </p>
          </div>
        ) : (
          <div className={styles.bookGrid}>
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </div>
        )}

        {/* Pagination THẬT */}
        {totalPages > 1 && (
          <nav aria-label="Library pagination" className={styles.pagination}>
            
            {/* Nút Lùi */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {/* Danh sách số trang */}
            <div className={styles.pageList}>
              {(() => {
                const pages = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    pages.push(i);
                  }
                }
                const finalPages = [];
                let lastAdded = 0;
                for (const page of pages) {
                  if (lastAdded > 0 && page - lastAdded > 1) {
                    finalPages.push('...');
                  }
                  finalPages.push(page);
                  lastAdded = page;
                }

                return finalPages.map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={currentPage === page ? styles.pageItemActive : styles.pageItemInactive}
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
              className={styles.pageButton}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

          </nav>
        )}
      </section>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setShowCategoryModal(false)}
        >
          <div className={styles.modalBackdrop} />
          
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHandle}>
              <div className={styles.modalHandleBar} />
            </div>
            
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderRow}>
                <div>
                  <h3 className={styles.modalTitle}>Chọn chủ đề</h3>
                  <p className={styles.modalSubtitle}>Khám phá các danh mục sách đa dạng</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className={styles.closeButton}
                >
                  <span className={cn("material-symbols-outlined", styles.closeIcon)}>close</span>
                </button>
              </div>
              
              <div className={styles.modalSearch}>
                <div className={styles.modalSearchWrapper}>
                  <div className={styles.modalSearchIcon}>
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Tìm nhanh chủ đề..."
                    className={styles.modalSearchInput}
                  />
                  {modalSearchQuery && (
                    <button 
                      onClick={() => setModalSearchQuery('')}
                      className={styles.modalSearchClear}
                    >
                      <span className={cn("material-symbols-outlined", styles.modalSearchClearIcon)}>cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.categoryGrid}>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setShowCategoryModal(false);
                  }}
                  className={selectedCategory === null ? styles.categoryCardActive : styles.categoryCardInactive}
                >
                  <div className={styles.categoryCardContent}>
                    <span className={cn("material-symbols-outlined", styles.categoryIcon, selectedCategory === null ? 'text-on-primary' : 'text-primary')}>
                      dashboard_customize
                    </span>
                    <span className={styles.categoryName}>Tất cả</span>
                  </div>
                  {selectedCategory === null && (
                    <div className={styles.categoryCheck}>
                      <span className={cn("material-symbols-outlined", styles.checkIcon)}>check_circle</span>
                    </div>
                  )}
                </button>

                {categories
                  .filter(cat => cat.name.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setShowCategoryModal(false);
                      }}
                      className={selectedCategory === cat.id ? styles.categoryCardActive : styles.categoryCardInactive}
                    >
                      <div className={styles.categoryCardContent}>
                        <span className={cn("material-symbols-outlined", styles.categoryIcon, selectedCategory === cat.id ? 'text-on-primary' : 'text-secondary')}>
                          category
                        </span>
                        <span className={styles.categoryName}>{cat.name}</span>
                      </div>
                      {selectedCategory === cat.id && (
                        <div className={styles.categoryCheck}>
                          <span className={cn("material-symbols-outlined", styles.checkIcon)}>check_circle</span>
                        </div>
                      )}
                    </button>
                  ))}
              </div>

              {categories.filter(cat => cat.name.toLowerCase().includes(modalSearchQuery.toLowerCase())).length === 0 && (
                <div className={styles.noResults}>
                  <div className={styles.noResultsIcon}>
                    <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
                  </div>
                  <p className={styles.noResultsText}>Không tìm thấy chủ đề nào phù hợp</p>
                  <button 
                    onClick={() => setModalSearchQuery('')}
                    className={styles.noResultsAction}
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              )}
            </div>
            
            <div className={styles.modalFooter} />
          </div>
        </div>
      )}
    </div>
  );
}
