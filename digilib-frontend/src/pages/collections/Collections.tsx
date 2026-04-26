import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { collectionService } from '@/services/collection.service';
import { bookService } from '@/services/book.service'; // Thêm import bookService
import { getImageUrl } from '@/lib/utils';
import type { Collection } from '@/types/collection.types';
import type { Book } from '@/types/book.types'; // Thêm import Book
import { useAuthStore } from '@/stores/authStore';
import '@/styles/view-transitions.css';


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
      // Khi lỗi, chỉ cần đưa state về rỗng là xong
      setFeaturedCollection(null);
      setCollections([]);
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
      <div className="aspect-video overflow-hidden relative">
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
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho ảnh bìa
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // State quản lý danh sách sách được chọn
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);

  // State tìm kiếm sách
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await bookService.getBooks({ q: searchTerm });
        const filteredResults = res.results.filter(
          (book) => !selectedBooks.find((selected) => selected.id === book.id)
        );
        setResults(filteredResults.slice(0, 5));
      } catch (error) {
        console.error('Lỗi tìm sách:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm, selectedBooks]);

  // Xử lý khi chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setCoverImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBooks((prev) => [...prev, book]);
    setSearchTerm('');
    setResults([]);
  };

  const handleRemoveSelectedBook = (bookId: number) => {
    setSelectedBooks((prev) => prev.filter((book) => book.id !== bookId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên bộ sưu tập');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Chuẩn bị dữ liệu dưới dạng FormData để gửi file
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      if (coverImage) {
        submitData.append('cover_image', coverImage); // Tên trường thường là cover_image theo Django model
      }

      // 2. Tạo bộ sưu tập
      const newCollection = await collectionService.createCollection(submitData as any);

      // 3. Add các sách đã chọn
      if (selectedBooks.length > 0) {
        await Promise.all(
          selectedBooks.map((book) => 
            collectionService.addBookToCollection(newCollection.id, book.id)
          )
        );
      }

      // Dọn dẹp URL blob để tránh memory leak
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      onSuccess();
    } catch (error) {
      alert('Tạo bộ sưu tập thất bại. Vui lòng kiểm tra lại.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold mb-6 font-headline">Tạo bộ sưu tập mới</h2>
        
        <form id="create-collection-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
          
          {/* Section: Upload Ảnh bìa */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Ảnh bìa</label>
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-outline-variant/50 rounded-xl bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors mb-2">add_photo_alternate</span>
                  <p className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    <span className="font-semibold">Nhấn để tải ảnh lên</span> hoặc kéo thả
                  </p>
                  <p className="text-xs text-outline mt-1">PNG, JPG, GIF lên đến 5MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            ) : (
              <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-error/90 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Xóa ảnh
                  </button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-outline-variant/30" />

          {/* Section: Thông tin cơ bản */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Tên bộ sưu tập *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ví dụ: Văn học cổ điển..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Mô tả</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                placeholder="Mô tả về bộ sưu tập này..."
              />
            </div>
          </div>

          <hr className="border-outline-variant/30" />

          {/* Section: Chọn sách */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Thêm sách vào bộ sưu tập</label>
            
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                placeholder="Tìm tên sách hoặc tác giả..."
              />
              
              {searchTerm.length >= 2 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-surface-container-high rounded-xl shadow-lg overflow-hidden border border-outline-variant/20">
                  {isSearching ? (
                    <p className="p-4 text-center text-on-surface-variant text-sm">Đang tìm kiếm...</p>
                  ) : results.length > 0 ? (
                    results.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => handleSelectBook(book)}
                        className="flex items-center gap-3 p-3 hover:bg-surface-container-highest cursor-pointer transition-colors"
                      >
                        <img src={getImageUrl(book.image)} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                        <div>
                          <p className="font-bold text-sm line-clamp-1">{book.title}</p>
                          <p className="text-xs text-on-surface-variant">{book.author}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-on-surface-variant text-sm">Không tìm thấy sách phù hợp.</p>
                  )}
                </div>
              )}
            </div>

            {selectedBooks.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-sm font-bold mb-3">Đã chọn ({selectedBooks.length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedBooks.map((book) => (
                    <div key={book.id} className="flex items-center justify-between bg-surface-container-lowest p-2 pr-3 rounded-lg border border-outline-variant/30">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img src={getImageUrl(book.image)} alt={book.title} className="w-8 h-10 object-cover rounded" />
                        <span className="text-sm font-medium line-clamp-1 truncate">{book.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedBook(book.id)}
                        className="text-error hover:bg-error/10 p-1 rounded-full transition-colors flex items-center justify-center shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="create-collection-form"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-md hover:shadow-lg disabled:opacity-70 transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Đang tạo...
              </>
            ) : 'Tạo bộ sưu tập'}
          </button>
        </div>
      </div>
    </div>
  );
}