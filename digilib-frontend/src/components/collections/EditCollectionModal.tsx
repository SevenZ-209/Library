import { useState, useEffect } from 'react';
import { collectionService } from '@/services/collection.service';
import { bookService } from '@/services/book.service';
import { getImageUrl } from '@/lib/utils';
import type { Collection } from '@/types/collection.types';
import type { Book } from '@/types/book.types';

interface EditCollectionModalProps {
  collection: Collection;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCollectionModal({ collection, onClose, onSuccess }: EditCollectionModalProps) {
  const [formData, setFormData] = useState({
    name: collection.name,
    description: collection.description || ''
  });
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(getImageUrl(collection.cover_image) || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LOGIC QUẢN LÝ SÁCH CHỜ THÊM ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Danh sách sách "đang chờ" để lưu (chưa push lên server)
  const [stagedBooks, setStagedBooks] = useState<Book[]>([]);

  // Tìm kiếm sách (Debounce)
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await bookService.getBooks({ q: searchTerm });
        setSearchResults(res.results.slice(0, 5));
      } catch (error) {
        console.error('Lỗi tìm sách:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Chỉ thêm vào danh sách chờ, CHƯA gọi API
  const handleStageBook = (book: Book) => {
    // Kiểm tra xem sách đã có trong database của bộ sưu tập chưa
    const isAlreadyInDB = collection.books?.some((cb: any) => cb.book_id === book.id);
    // Kiểm tra xem sách đã có trong danh sách chờ chưa
    const isAlreadyStaged = stagedBooks.some(b => b.id === book.id);

    if (isAlreadyInDB || isAlreadyStaged) {
      alert('Sách này đã có trong danh sách!');
      return;
    }

    setStagedBooks(prev => [...prev, book]);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Xóa khỏi danh sách chờ
  const handleUnstageBook = (bookId: number) => {
    setStagedBooks(prev => prev.filter(b => b.id !== bookId));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // HÀM LƯU TỔNG THỂ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Cập nhật thông tin cơ bản (Tên, Mô tả, Ảnh)
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      if (coverImage) submitData.append('cover_image', coverImage);

      await collectionService.updateCollection(collection.id, submitData);

      // 2. Chỉ khi cập nhật thông tin xong mới push danh sách sách chờ lên server
      if (stagedBooks.length > 0) {
        await Promise.all(
          stagedBooks.map(book => collectionService.addBookToCollection(collection.id, book.id))
        );
      }

      onSuccess(); // Load lại dữ liệu trang Detail
    } catch (error) {
      alert('Cập nhật thất bại!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar border border-outline-variant/20">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold font-headline text-on-surface">Cấu hình tuyển tập</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              <span className="text-xs font-bold uppercase tracking-widest">Thông tin cơ bản</span>
            </div>

            <div className="flex gap-6 items-start">
                <div className="relative w-28 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container shadow-md group border border-outline-variant/30">
                    <img src={previewUrl || ''} className="w-full h-full object-cover" alt="Cover" />
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                        <span className="material-symbols-outlined text-white">add_a_photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>

                <div className="flex-1 space-y-4">
                    <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary border-none font-bold"
                        placeholder="Tên bộ sưu tập..."
                        required
                    />
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary border-none text-sm min-h-[80px]"
                        placeholder="Mô tả về tuyển tập này..."
                    />
                </div>
            </div>
          </div>

          <div className="h-px bg-outline-variant/20" />

          {/* PHẦN 2: CHỌN SÁCH CHỜ LƯU */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-sm">library_add</span>
              <span className="text-xs font-bold uppercase tracking-widest">Thêm sách mới</span>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-2xl outline-none focus:ring-2 focus:ring-primary border-none text-sm"
                placeholder="Tìm tên sách để đưa vào danh sách chờ..."
              />
              
              {/* Dropdown kết quả tìm kiếm */}
              {searchTerm.length >= 2 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-3 bg-surface-container-high rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {isSearching ? (
                    <div className="p-6 text-center text-sm text-outline flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Đang tìm kiếm...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {searchResults.map((book) => {
                        const isAlreadyInDB = collection.books?.some((cb: any) => cb.book_id === book.id);
                        const isStaged = stagedBooks.some(b => b.id === book.id);
                        return (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() => handleStageBook(book)}
                            disabled={isAlreadyInDB || isStaged}
                            className={`w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors border-b border-outline-variant/10 last:border-none ${(isAlreadyInDB || isStaged) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                          >
                            <img src={getImageUrl(book.image)} className="w-10 h-14 object-cover rounded-lg shadow-sm" alt={book.title} />
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-sm truncate text-on-surface">{book.title}</p>
                              <p className="text-xs text-outline truncate">{book.author}</p>
                            </div>
                            {(isAlreadyInDB || isStaged) ? (
                              <span className="text-[10px] font-bold bg-surface-container text-outline px-2 py-1 rounded-full uppercase tracking-tighter">
                                {isAlreadyInDB ? 'Đã có' : 'Đã chọn'}
                              </span>
                            ) : (
                              <span className="material-symbols-outlined text-primary">add_circle</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-outline italic">Không tìm thấy sách</div>
                  )}
                </div>
              )}
            </div>

            {/* HIỂN THỊ DANH SÁCH SÁCH ĐANG CHỜ LƯU */}
            {stagedBooks.length > 0 && (
              <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">pending_actions</span>
                  Sách chuẩn bị thêm ({stagedBooks.length})
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {stagedBooks.map(book => (
                    <div key={book.id} className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20 animate-in slide-in-from-left-2">
                      <img src={getImageUrl(book.image)} className="w-8 h-12 object-cover rounded shadow-sm" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{book.title}</p>
                        <p className="text-[10px] text-outline truncate">{book.author}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleUnstageBook(book.id)}
                        className="p-1 hover:bg-error/10 text-error rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">remove_circle</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/20">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 font-bold text-on-surface-variant hover:bg-surface-container rounded-full transition-all"
            >
                Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-10 py-2.5 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : null}
              Lưu tất cả thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}