import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collectionService } from '@/services/collection.service';
import { getImageUrl, formatDate } from '@/lib/utils';
import type { Collection, CollectionBook } from '@/types/collection.types';
import { useAuthStore } from '@/stores/authStore';
import '@/styles/view-transitions.css';
import EditCollectionModal from '@/components/collections/EditCollectionModal';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [books, setBooks] = useState<CollectionBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isAdminOrLibrarian = user?.role === 'admin' || user?.role === 'librarian';

  const fetchCollectionDetail = useCallback(async () => {
    if (!id) return;
    const collectionId = parseInt(id);
    
    try {
      const data = await collectionService.getCollection(collectionId);
      setCollection(data);
      setBooks(data.books || []);
    } catch (error) {
      console.error('Failed to fetch collection:', error);
      setCollection(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    fetchCollectionDetail();
  }, [fetchCollectionDetail]);

  const handleRemoveBook = async (bookId: number) => {
    if (!collection) return;
    if (window.confirm('Bạn có chắc muốn rút cuốn sách này khỏi bộ sưu tập?')) {
      try {
        await collectionService.removeBookFromCollection(collection.id, bookId);
        fetchCollectionDetail();
      } catch (error) {
        alert('Lỗi khi rút sách ra khỏi bộ sưu tập!');
        console.error(error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">error</span>
        <h2 className="text-2xl font-bold">Không tìm thấy bộ sưu tập</h2>
        <button onClick={() => navigate('/collections')} className="mt-4 text-primary font-bold hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  const coverImageUrl = getImageUrl(collection.cover_image) || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600';

  return (
    <div className="animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      {/* Hero Header Section - ĐÃ CHỈNH SỬA BỐ CỤC DỌC (PORTRAIT) */}
      <section className="relative -mt-8 mb-12 overflow-hidden rounded-b-[40px] bg-surface-container-low border-b border-outline-variant/30">
        
        {/* 1. Nền làm mờ (Blurred Background effect) */}
        <div className="absolute inset-0 -z-10">
          <img 
            src={coverImageUrl} 
            className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
            alt="Blurred Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/80 to-transparent" />
        </div>

        {/* 2. Container nội dung chính (Flex layout) */}
        <div className="max-w-screen-2xl mx-auto px-8 py-16 md:py-24 flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-16 relative">
          
          {/* CỘT 1: Hình Cover Dạng Dọc (Portrait aspect-[2/3]) - Giống hình cuốn sách */}
          <div className="w-60 md:w-72 shrink-0 animate-slide-up">
            <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border-4 border-surface-container-lowest">
              <img 
                src={getImageUrl(collection.cover_image) || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800'} 
                className="w-full h-full object-cover"
                alt={collection.name}
              />
            </div>
          </div>
          
          {/* CỘT 2: Nội dung text và nút bấm */}
          <div className="flex-1 flex flex-col gap-6 text-center md:text-left animate-slide-up" style={{animationDelay: '150ms'}}>
            <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium justify-center md:justify-start">
              <Link to="/collections" className="hover:text-primary transition-colors">Bộ sưu tập</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-on-surface">Chi tiết</span>
            </nav>
            
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface leading-tight">
              {collection.name}
            </h1>
            
            {/* Thông tin Meta Badges */}
            <div className="flex flex-wrap items-center gap-4 text-on-surface-variant justify-center md:justify-start">
              <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
                <span className="font-medium text-sm">{collection.curator_name}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                <span className="text-sm">{formatDate(collection.created_date)}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-sm">library_books</span>
                <span className="text-sm">{books.length} cuốn sách</span>
              </div>
            </div>

            {/* Nút Chỉnh sửa cho Admin/Librarian (Chuyển vị trí xuống dưới text) */}
            {isAdminOrLibrarian && (
              <div className="mt-6 flex justify-center md:justify-start">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2.5 px-8 py-3 bg-primary text-on-primary hover:bg-primary/90 rounded-full font-bold transition-all shadow-md active:scale-95 shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-xl">edit</span>
                  Sửa bộ sưu tập
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="px-8 max-w-screen-2xl mx-auto mb-16 animate-slide-up" style={{animationDelay: '300ms'}}>
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/20">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2.5 text-on-surface">
            <span className="material-symbols-outlined text-primary">info</span>
            Giới thiệu bộ sưu tập
          </h2>
          <p className="text-on-surface-variant leading-relaxed text-lg whitespace-pre-line">
            {collection.description || "Chưa có mô tả cho bộ sưu tập này."}
          </p>
        </div>
      </section>

      {/* Books Grid Section */}
      <section className="px-8 max-w-screen-2xl mx-auto animate-slide-up" style={{animationDelay: '450ms'}}>
        <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3 text-on-surface">
          Sách trong bộ sưu tập
          <span className="h-1 w-20 bg-primary rounded-full"></span>
        </h2>
        
        {books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {books.map((book) => (
              <div key={book.id} className="group flex flex-col bg-surface-container-lowest p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/20 border border-outline-variant/10 transition-all duration-300 relative">
                
                {isAdminOrLibrarian && (
                  <button 
                    onClick={() => handleRemoveBook(book.book_id)}
                    className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-error text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa khỏi bộ sưu tập"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}

                <div className="aspect-[2/3] overflow-hidden rounded-lg mb-4 bg-surface-container relative">
                  {book.image ? (
                    <img
                      src={getImageUrl(book.image)}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-container/10">
                      <span className="material-symbols-outlined text-5xl text-primary/30">menu_book</span>
                    </div>
                  )}
                </div>

                <div className="flex-grow mb-4">
                  <h3 className="font-headline font-bold text-base leading-tight text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-on-surface-variant/80 text-xs mt-1.5 line-clamp-1 italic">
                    {book.author}
                  </p>
                </div>

                <Link 
                  to={`/book/${book.book_id}`}
                  className="w-full py-2.5 rounded-full bg-surface-container-high hover:bg-primary hover:text-white text-on-surface hover:text-white text-center font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Xem chi tiết
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-7xl text-outline mb-5">library_add</span>
            <p className="text-on-surface-variant text-xl font-medium">Bộ sưu tập này chưa có sách.</p>
            {isAdminOrLibrarian && (
                <p className="text-sm text-outline mt-1">Hãy nhấn 'Sửa' để thêm sách vào đây.</p>
            )}
          </div>
        )}
      </section>

      {/* Edit Collection Modal */}
      {isEditModalOpen && collection && (
        <EditCollectionModal 
          collection={collection} 
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchCollectionDetail();
          }}
        />
      )}
    </div>
  );
}