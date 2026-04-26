import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { collectionService } from '@/services/collection.service';
import { getImageUrl } from '@/lib/utils';
import type { Collection } from '@/types/collection.types';
import { useAuthStore } from '@/stores/authStore';
import '@/styles/view-transitions.css';

// Demo data phù hợp với design system hiện tại
const DEMO_COLLECTIONS: Collection[] = [
  {
    id: 1,
    name: 'Ancient Wisdom',
    description: 'Một hành trình sâu sắc vào những văn tự cổ xưa, khám phá triết học, khoa học và nghệ thuật của các nền văn minh sơ khai định hình thế giới hiện đại.',
    cover_image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
    book_count: 42,
    curator_name: 'Dr. Elena Vance',
    is_featured: true,
    created_date: '2023-01-01',
    updated_date: '2023-11-15',
  },
  {
    id: 2,
    name: 'Scientific Revolutions',
    description: 'Tài liệu về những bước ngoặt vĩ đại trong khoa học, từ thiên văn học đến vật lý học lượng tử.',
    cover_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    book_count: 28,
    curator_name: 'Prof. James Chen',
    is_featured: false,
    created_date: '2023-02-01',
    updated_date: '2023-10-20',
  },
  {
    id: 3,
    name: 'Poetry of the East',
    description: 'Những vần thơ mượt mà và sâu lắng từ các nhà thơ lừng danh phương Đông, tôn vinh vẻ đẹp tự nhiên và tâm hồn.',
    cover_image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800',
    book_count: 35,
    curator_name: 'Mei Lin',
    is_featured: false,
    created_date: '2023-03-01',
    updated_date: '2023-09-12',
  },
  {
    id: 4,
    name: 'Historical Manuscripts',
    description: 'Bộ sưu tập các bản thảo lịch sử quý giá, ghi chép lại những biến cố và văn hóa của nhiều thế kỷ trước.',
    cover_image: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800',
    book_count: 56,
    curator_name: 'Dr. Marcus Webb',
    is_featured: false,
    created_date: '2023-04-01',
    updated_date: '2023-08-30',
  },
  {
    id: 5,
    name: 'Modern Philosophy',
    description: 'Những tư tưởng đương đại định nghĩa lại cách chúng ta nhìn nhận thế giới.',
    cover_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    book_count: 24,
    curator_name: 'Dr. Sarah Kim',
    is_featured: false,
    created_date: '2023-05-01',
    updated_date: '2023-07-18',
  },
  {
    id: 6,
    name: 'Art & Architecture',
    description: 'Những kiệt tác định nghĩa vẻ đẹp xuyên qua các nền văn hóa.',
    cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    book_count: 31,
    curator_name: 'Luca Romano',
    is_featured: false,
    created_date: '2023-06-01',
    updated_date: '2023-06-25',
  },
];

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [featuredCollection, setFeaturedCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isAdminOrLibrarian = user?.role === 'admin' || user?.role === 'librarian';

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    try {
      const data = await collectionService.getCollections({
        q: debouncedSearch || undefined,
        page: currentPage,
      });
      
      if (data.results.length > 0 && currentPage === 1 && !debouncedSearch) {
        setFeaturedCollection(data.results[0]);
        setCollections(data.results.slice(1));
      } else {
        setFeaturedCollection(null);
        setCollections(data.results);
      }
      
      const totalItems = data.count || 0;
      setTotalPages(Math.ceil(totalItems / 8));
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      // Demo fallback data - match với project
      setFeaturedCollection(DEMO_COLLECTIONS[0]);
      setCollections(DEMO_COLLECTIONS.slice(1));
      setTotalPages(1);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  // Stagger animation
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-slide-up');
    elements.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${i * 100}ms`;
    });
  }, [collections.length]);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Search Section */}
      <section className="mb-12 flex flex-col items-center text-center max-w-4xl mx-auto px-8">
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight animate-slide-up">
          Bộ sưu tập
        </h1>
        <p className="text-xl text-on-surface-variant mb-8 animate-slide-up">
          Khám phá những tuyển tập được chọn lọc bởi các chuyên gia
        </p>

        {/* Search Input */}
        <div className="w-full relative group animate-slide-up">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-16 pr-6 bg-surface-container-highest border-none rounded-full text-lg font-[family-name:var(--font-body)] focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline/60"
            placeholder="Tìm kiếm bộ sưu tập..."
          />
        </div>
      </section>

      {/* Featured Collection Hero */}
      {featuredCollection && !searchQuery && (
        <section className="px-8 mb-12 max-w-screen-2xl mx-auto animate-slide-up">
          <div 
            className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg shadow-primary/10"
            onClick={() => navigate(`/collections/${featuredCollection.id}`)}
          >
            {/* Background Image */}
            <img 
              src={getImageUrl(featuredCollection.cover_image) || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600'}
              alt="Featured Collection"
              className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center p-10 md:p-16">
              <span className="text-sm font-semibold tracking-wider text-white/80 uppercase mb-2 font-[family-name:var(--font-label)]">
                Bộ sưu tập nổi bật
              </span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {featuredCollection.name}
              </h2>
              <p className="text-white/90 max-w-xl mb-6 font-[family-name:var(--font-body)]">
                {featuredCollection.description}
              </p>
              <button className="w-fit bg-white text-primary px-8 py-3 rounded-full font-[family-name:var(--font-label)] font-bold text-sm tracking-wide hover:bg-surface-container-low transition-colors duration-300 flex items-center gap-2 shadow-lg">
                Khám phá ngay
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Collections Grid */}
      <section className="px-8 pb-20 max-w-screen-2xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">collections_bookmark</span>
            Tất cả bộ sưu tập
          </h2>
          {isAdminOrLibrarian && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2 rounded-full bg-secondary-container text-on-secondary-container font-[family-name:var(--font-label)] text-sm font-medium hover:bg-secondary-fixed transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Tạo mới
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CollectionCardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : collections.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
              Không tìm thấy bộ sưu tập
            </h3>
            <p className="text-on-surface-variant">
              Không có kết quả cho "{searchQuery}"
            </p>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">collections_bookmark</span>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
              Chưa có bộ sưu tập nào
            </h3>
            <p className="text-on-surface-variant">
              Hãy tạo bộ sưu tập đầu tiên của bạn!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, index) => (
              <CollectionCard 
                key={collection.id} 
                collection={collection} 
                index={index}
                onClick={() => navigate(`/collections/${collection.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Collections pagination" className="mt-16 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-30 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="flex gap-1">
              {(() => {
                const pages = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    pages.push(i);
                  }
                }
                const finalPages: (number | string)[] = [];
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

      {isCreateModalOpen && (
        <CreateCollectionModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function CollectionCard({ collection, onClick, index = 0 }: { collection: Collection; onClick: () => void; index?: number }) {
  return (
    <article 
      className="group bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 flex flex-col cursor-pointer"
      onClick={onClick}
      style={{
        animationDelay: `${index * 80}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Cover Image */}
      <div className="aspect-[16/10] overflow-hidden relative">
        {collection.cover_image ? (
          <img 
            src={getImageUrl(collection.cover_image)} 
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-primary/40">collections_bookmark</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Items count badge */}
        <span className="absolute bottom-3 right-3 bg-surface/90 text-primary px-3 py-1 rounded-full font-[family-name:var(--font-label)] text-xs font-semibold backdrop-blur-sm">
          {collection.book_count} Items
        </span>
      </div>
      
      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {collection.name}
        </h3>
        <p className="font-[family-name:var(--font-body)] text-sm text-on-surface-variant line-clamp-2 flex-grow">
          {collection.description}
        </p>
        
        {/* Curator info */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-sm">person</span>
          <span className="text-xs text-on-surface-variant font-[family-name:var(--font-label)]">
            {collection.curator_name}
          </span>
        </div>
      </div>
    </article>
  );
}

function CollectionCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="bg-surface-container-lowest rounded-xl overflow-hidden animate-pulse"
      style={{
        animationDelay: `${index * 80}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards',
        opacity: 0,
      }}
    >
      <div className="aspect-[16/10] bg-surface-container" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-surface-container rounded w-3/4" />
        <div className="h-4 bg-surface-container rounded w-full" />
        <div className="h-4 bg-surface-container rounded w-1/2" />
        <div className="h-4 bg-surface-container rounded w-2/3" />
      </div>
    </div>
  );
}

function CreateCollectionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await collectionService.createCollection({ name, description });
      onSuccess();
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Tạo bộ sưu tập thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold text-on-surface">Tạo Bộ Sưu Tập Mới</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1 font-[family-name:var(--font-label)]">
                Tên bộ sưu tập <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest"
                placeholder="Ví dụ: Sách Nổi Bật 2026"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1 font-[family-name:var(--font-label)]">
                Mô tả
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest resize-none"
                placeholder="Mô tả ngắn gọn về bộ sưu tập..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-full font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors font-[family-name:var(--font-label)] disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2 rounded-full font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors font-[family-name:var(--font-label)] disabled:opacity-50 flex items-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Đang tạo...
                </>
              ) : (
                'Tạo mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
