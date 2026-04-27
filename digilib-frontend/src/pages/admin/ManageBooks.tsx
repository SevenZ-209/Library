import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { bookService } from '@/services/book.service';
import { categoryService } from '@/services/category.service';
import { useUIStore } from '@/stores/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import type { Book, Category } from '@/types/book.types';
import { collectionService } from '@/services/collection.service';
import type { Collection } from '@/types/collection.types';

export default function ManageBooksPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    collection: '',
    total_copies: 1,
  });

  const fetchData = async () => {
    try {
      const [booksData, catsData, colsData] = await Promise.all([
        bookService.getBooks(),
        categoryService.getCategories(),
        collectionService.getCollections()
      ]);
      setBooks(booksData.results || []);
      setCategories(catsData);
      setCollections(colsData.results || []);
      if (catsData.length > 0) {
        setFormData(prev => ({ ...prev, category: catsData[0].id.toString() }));
      }
    } catch {
      addToast('Lỗi tải dữ liệu', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBooks = useMemo(() => {
    if (!debouncedSearch) return books;
    const query = debouncedSearch.toLowerCase();
    return books.filter(
      book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }, [books, debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      addToast('Vui lòng điền đầy đủ Tên sách và Tác giả', 'warning');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('category', formData.category);
      data.append('total_copies', formData.total_copies.toString());
      data.append('available_copies', formData.total_copies.toString());
      if (imageFile) {
        data.append('image', imageFile); 
      }
  
      const newBook = await bookService.createBook(data); 

      if (formData.collection) {
        await collectionService.addBookToCollection(parseInt(formData.collection), newBook.id);
      }
      
      addToast('Đăng sách thành công!', 'success');
      setShowForm(false);
      setImageFile(null);
      setFormData(prev => ({ ...prev, collection: '' }));
      fetchData();
    } catch {
      addToast('Thêm sách thất bại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      addToast('Vui lòng nhập tên thể loại', 'warning');
      return;
    }
    
    setIsCreatingCategory(true);
    try {
      const newCategory = await categoryService.createCategory(newCategoryName.trim());
      addToast('Đã thêm thể loại mới', 'success');
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category: newCategory.id.toString() }));
      setShowCategoryModal(false);
      setNewCategoryName('');
    } catch {
      addToast('Lỗi khi thêm thể loại', 'error');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sách này? Dữ liệu không thể khôi phục!")) return;
    try {
      await bookService.deleteBook(id);
      addToast('Đã xóa sách', 'success');
      fetchData();
    } catch {
      addToast('Lỗi khi xóa sách', 'error');
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'librarian') {
    return <div className="p-8 text-center text-error font-bold">Truy cập bị từ chối</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline font-extrabold text-3xl">Quản lý Sách</h2>
          <p className="text-on-surface-variant mt-1">Quản lý kho sách vật lý của thư viện</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-gradient px-6 py-3 rounded-full flex items-center gap-2 font-bold"
        >
          <span className="material-symbols-outlined text-sm">{showForm ? 'close' : 'add'}</span> 
          {showForm ? 'Đóng Form' : 'Thêm sách mới'}
        </button>
      </div>


      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm theo tên sách, tác giả..."
          className="w-full pl-12 pr-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-headline font-bold text-xl mb-4 border-b border-outline-variant/20 pb-2">Thông tin sách mới</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">Tên sách</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="VD: Harry Potter và Hòn đá phù thủy"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">Tác giả</label>
              <input 
                type="text" 
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="VD: J.K. Rowling"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">Thể loại</label>
              <div className="flex items-center gap-2">
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="flex-1 px-4 py-3 bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="w-12 h-12 shrink-0 flex items-center justify-center bg-surface-container-high hover:bg-primary hover:text-on-primary rounded-lg text-on-surface transition-all active:scale-95"
                  title="Thêm thể loại mới"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">Tổng số bản nhập về</label>
              <input 
                type="number" 
                min="1"
                value={formData.total_copies}
                onChange={e => setFormData({...formData, total_copies: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">Thêm vào bộ sưu tập (Tùy chọn)</label>
              <select 
                value={formData.collection}
                onChange={e => setFormData({...formData, collection: e.target.value})}
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
              >
                <option value="">-- Không thêm vào bộ sưu tập nào --</option>
                {collections.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">Ảnh bìa sách</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                {imageFile && <span className="text-xs text-primary font-bold">Đã chọn: {imageFile.name}</span>}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-full font-bold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu vào kho'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">TÊN SÁCH</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">TÁC GIẢ</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">TRONG KHO</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)] text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredBooks.map((book) => (
              <tr key={book.id} className="hover:bg-surface-container-low/50">
                <td className="px-6 py-4 font-bold text-sm">{book.title}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{book.author}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="font-bold text-primary">{book.available_copies}</span>
                  <span className="text-on-surface-variant"> / {book.total_copies}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(book.id)} className="text-error hover:bg-error/10 font-bold text-xs px-3 py-2 rounded transition-colors">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-on-surface-variant">
                  {debouncedSearch ? `Không tìm thấy sách nào cho "${debouncedSearch}"` : 'Chưa có sách nào trong kho.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCategoryModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowCategoryModal(false)}
        >
          <div 
            className="bg-surface rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10">
              <h3 className="font-headline font-bold text-xl text-on-surface">Thêm Thể Loại Mới</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="p-6">
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-on-surface-variant">Tên thể loại</label>
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="VD: Tiểu thuyết viễn tưởng"
                  className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 rounded-full font-bold hover:bg-surface-container-high transition-colors text-on-surface"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                  className="bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container px-6 py-2.5 rounded-full font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreatingCategory && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}