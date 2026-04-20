import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService } from '@/services/book.service';
import { Badge } from '@/components/ui/Badge';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { formatDate } from '@/lib/utils';
import type { Book, BorrowRecord } from '@/types/book.types';
import '@/styles/view-transitions.css';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBookData = async () => {
      setIsLoading(true);
      try {
        const [bookData, historyData, relatedData] = await Promise.all([
          bookService.getBook(parseInt(id)),
          bookService.getBorrowHistory(parseInt(id)),
          bookService.getBooks({ category_id: 0 }),
        ]);
        setBook(bookData);
        setBorrowHistory(historyData);
        setRelatedBooks(relatedData.results.filter((b) => b.id !== parseInt(id)).slice(0, 4));
      } catch {
        addToast('Không thể tải thông tin sách', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookData();
  }, [id, addToast]);

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!book) return;

    try {
      setIsBorrowing(true);
      await bookService.borrowBook(book.id);
      addToast('Yêu cầu mượn đã được gửi!', 'success');
    } catch {
      addToast('Không thể gửi yêu cầu mượn. Vui lòng thử lại.', 'error');
    } finally {
      setIsBorrowing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 pt-32 pb-20">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4 lg:col-span-3">
            <BookCardSkeleton />
          </div>
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div className="space-y-4">
              <div className="h-4 w-24 bg-surface-container rounded-full animate-pulse" />
              <div className="h-12 w-3/4 bg-surface-container rounded animate-pulse" />
              <div className="h-6 w-1/2 bg-surface-container rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 pt-32 text-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">menu_book</span>
        <h2 className="text-2xl font-headline font-bold">Không tìm thấy sách</h2>
        <p className="text-on-surface-variant mt-2">Sách này có thể đã bị xóa.</p>
        <button onClick={() => navigate('/')} className="btn-gradient px-6 py-2 rounded-full mt-6">
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-8 pt-28 pb-32">
      {/* Hero Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-start mb-20">
        {/* Left: Book Cover */}
        <div className="md:col-span-5 lg:col-span-4 sticky top-28">
          <div
            className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,104,95,0.15)] group"
            style={{ viewTransitionName: `book-cover-${book.id}` }}
          >
            {book.image ? (
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-container/10">
                <span className="material-symbols-outlined text-7xl text-primary/30">menu_book</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {/* Category & Status */}
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary">{book.category_name}</Badge>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full">
                <span
                  className={`w-2 h-2 rounded-full ${
                    book.available_copies > 0 ? 'bg-primary' : 'bg-outline'
                  }`}
                />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-[family-name:var(--font-label)]">
                  {book.available_copies > 0 ? 'Còn sách' : 'Đã cho mượn'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl lg:text-7xl font-headline font-extrabold text-on-surface tracking-tighter leading-tight">
              {book.title}
            </h1>
            <p className="text-xl text-on-surface-variant font-medium flex items-center gap-2 mt-2">
              <span className="text-primary font-bold">Tác giả:</span> {book.author}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 py-4">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-colors cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Borrow + Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button
              onClick={handleBorrow}
              disabled={book.available_copies === 0 || isBorrowing}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold rounded-full shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isBorrowing ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  {book.available_copies > 0 ? 'Mượn sách' : 'Đặt chỗ'}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-2">
              <button
                className="p-3 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-highest transition-all"
                title="Chia sẻ"
              >
                <span className="material-symbols-outlined">share</span>
              </button>
              <button
                className="p-3 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-highest transition-all"
                title="Yêu thích"
              >
                <span className="material-symbols-outlined">favorite</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="mt-8 space-y-4 max-w-3xl">
              <h3 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                Giới thiệu
              </h3>
              <div className="text-lg text-on-surface-variant leading-relaxed font-[family-name:var(--font-body)] space-y-4">
                <p>{book.description}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-outline-variant/30">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">inventory_2</span>
              <span>{book.available_copies} / {book.total_copies} bản</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              <span>Thêm ngày {formatDate(book.created_date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow History */}
      {borrowHistory.length > 0 && (
        <section className="mb-20 bg-surface-container-low rounded-3xl p-8 lg:p-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
                Lịch sử mượn sách
              </h3>
              <p className="text-on-surface-variant mt-1">
                Timeline hành trình của cuốn sách này.
              </p>
            </div>
            <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
              Xem tất cả
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b border-outline-variant/30">
                  {['Mã BD', 'Ngày mượn', 'Ngày trả', 'Trạng thái'].map((h) => (
                    <th
                      key={h}
                      className="pb-4 font-headline text-on-surface-variant font-semibold px-4 uppercase text-xs tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {borrowHistory.slice(0, 5).map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-surface-container-high transition-colors group"
                  >
                    <td className="py-4 px-4 font-mono text-sm text-on-surface">
                      #{record.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant">{formatDate(record.borrow_date)}</td>
                    <td className="py-4 px-4 text-on-surface-variant">
                      {record.return_date ? formatDate(record.return_date) : '—'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Badge
                        variant={
                          record.status === 'returned'
                            ? 'success'
                            : record.status === 'overdue'
                            ? 'error'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {record.status === 'returned'
                          ? 'Đã trả'
                          : record.status === 'overdue'
                          ? 'Quá hạn'
                          : 'Đang mượn'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
                Sách liên quan
              </h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary transition-all shadow-sm">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-2 rounded-full bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary transition-all shadow-sm">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
            {relatedBooks.map((relBook) => (
              <div
                key={relBook.id}
                className="min-w-[280px] group snap-start"
              >
                <div className="aspect-[2/3] bg-surface-container-lowest rounded-xl overflow-hidden mb-4 transition-transform group-hover:scale-[1.02] duration-300">
                  {relBook.image ? (
                    <img
                      src={relBook.image}
                      alt={relBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-container/10">
                      <span className="material-symbols-outlined text-4xl text-primary/30">menu_book</span>
                    </div>
                  )}
                </div>
                <h4 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                  {relBook.title}
                </h4>
                <p className="text-sm text-on-surface-variant">{relBook.author}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
