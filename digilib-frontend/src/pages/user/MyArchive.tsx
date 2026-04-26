import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBorrowStore } from '@/stores/borrowStore';
import { formatDate } from '@/lib/utils';
import '@/styles/view-transitions.css';

// Removed static now constant to use real-time state inside component

type TabType = 'borrowed' | 'returned' | 'overdue';

export default function MyArchivePage() {
  const { isAuthenticated } = useAuthStore();
  const { records, fetchRecords, isLoading } = useBorrowStore();
  const [activeTab, setActiveTab] = useState<TabType>('borrowed');
  const [now, setNow] = useState(Date.now());

  // Cập nhật thời gian thực mỗi phút để thanh progress bar chính xác
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated, fetchRecords]);

  const filteredRecords = records.filter((record) => {
    switch (activeTab) {
      case 'borrowed':
        return record.status === 'borrowed' || record.status === 'pending';
      case 'returned':
        return record.status === 'returned';
      case 'overdue':
        return record.status === 'overdue';
      default:
        return true;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'borrowed':
        return { label: 'Active', class: 'bg-primary/90 backdrop-blur-md text-on-primary' };
      case 'pending':
        return { label: 'Pending', class: 'bg-secondary/90 backdrop-blur-md text-on-secondary' };
      case 'returned':
        return { label: 'Returned', class: 'bg-surface-container-highest/90 backdrop-blur-md text-on-surface-variant' };
      case 'overdue':
        return { label: 'Overdue', class: 'bg-error/90 backdrop-blur-md text-on-error' };
      default:
        return { label: status, class: 'bg-surface-container text-on-surface-variant' };
    }
  };

  const getProgressPercentage = (borrowDate: string, dueDate: string) => {
    const start = new Date(borrowDate).getTime();
    const end = new Date(dueDate).getTime();
    const total = end - start;
    const elapsed = now - start;
    const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return percentage;
  };

  const getProgressColor = (percentage: number, isOverdue: boolean) => {
    if (isOverdue) return 'bg-error';
    if (percentage > 80) return 'bg-tertiary';
    if (percentage > 50) return 'bg-secondary';
    return 'bg-primary';
  };

  const getProgressLabel = (isOverdue: boolean, dueDate: string) => {
    if (isOverdue) {
      const overdueDays = Math.ceil((now - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
      return { text: 'Quá hạn', days: `${overdueDays} ngày`, color: 'text-error' };
    }
    const remainingDays = Math.ceil((new Date(dueDate).getTime() - now) / (1000 * 60 * 60 * 24));
    return { text: 'Thời gian còn lại', days: `${remainingDays} ngày`, color: 'text-primary' };
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-32 pb-20 text-center">
        <span className="material-symbols-outlined text-8xl text-outline mb-6">account_circle</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-4">
          Vui lòng đăng nhập
        </h2>
        <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
          Để xem tủ sách cá nhân của bạn, vui lòng đăng nhập hoặc tạo tài khoản mới.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-full font-semibold hover:bg-secondary-container/80 transition-colors"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    );
  }

  const borrowedCount = records.filter(r => r.status === 'borrowed' || r.status === 'pending').length;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-28 pb-32">
      {/* Hero Header */}
      <header className="mb-12">
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-on-surface mb-4">
          Tủ sách của tôi
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Bạn đang có <span className="font-semibold text-primary">{borrowedCount}</span> cuốn sách trong bộ sưu tập.
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
        {[
          { key: 'borrowed' as TabType, label: 'Đang mượn', count: records.filter(r => r.status === 'borrowed' || r.status === 'pending').length },
          { key: 'returned' as TabType, label: 'Đã trả', count: records.filter(r => r.status === 'returned').length },
          { key: 'overdue' as TabType, label: 'Quá hạn', count: records.filter(r => r.status === 'overdue').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-6 py-2.5 rounded-full font-semibold text-sm transition-transform duration-200 active:scale-95 whitespace-nowrap
              ${activeTab === tab.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }
            `}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${activeTab === tab.key ? 'bg-on-primary/20' : 'bg-surface-container-highest'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-5 animate-pulse">
              <div className="aspect-[3/4] bg-surface-container rounded-lg mb-5" />
              <div className="h-5 bg-surface-container rounded w-3/4 mb-2" />
              <div className="h-3 bg-surface-container rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-surface-container rounded w-full" />
                <div className="h-3 bg-surface-container rounded w-3/4" />
              </div>
              <div className="mt-6 h-1.5 bg-surface-container rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredRecords.map((record, index) => {
            const percentage = getProgressPercentage(record.borrow_date, record.due_date);
            const isOverdue = record.status === 'overdue';
            const status = getStatusBadge(record.status);
            const progressInfo = getProgressLabel(isOverdue, record.due_date);

            return (
              <article
                key={record.id}
                className="group bg-surface-container-lowest rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
                style={{
                  animationDelay: `${index * 80}ms`,
                  animation: 'fadeInUp 0.4s ease-out forwards',
                  opacity: 0,
                }}
              >
                {/* Book Cover */}
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-5 bg-surface-container">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-container/10">
                    <span className="material-symbols-outlined text-5xl text-primary/30">
                      menu_book
                    </span>
                  </div>
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <span className={`${status.class} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Book Details */}
                <div className="flex-grow">
                  <h3 className="font-headline font-bold text-xl text-on-surface group-hover:text-primary transition-colors mb-1 line-clamp-2">
                    {record.book_title}
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-4 italic line-clamp-1">
                    {record.borrower_name}
                  </p>

                  {/* Dates */}
                  <div className="space-y-2 text-xs font-medium text-on-surface-variant">
                    <div className="flex justify-between items-center">
                      <span>Ngày mượn</span>
                      <span className="text-on-surface">{formatDate(record.borrow_date)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hạn trả</span>
                      <span className={`font-medium ${isOverdue ? 'text-error' : 'text-on-surface'}`}>
                        {formatDate(record.due_date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className={`flex justify-between items-center mb-1.5 text-[10px] font-bold uppercase tracking-tighter ${progressInfo.color}`}>
                    <span>{progressInfo.text}</span>
                    <span>{progressInfo.days}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage, isOverdue)}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-2">
                  <Link
                    to={`/book/${record.book_id}`}
                    className="flex-1 py-2.5 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all duration-300 text-sm font-semibold text-center"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-2xl p-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">library_books</span>
          </div>
          <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">
            Chưa có sách nào
          </h3>
          <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
            {activeTab === 'borrowed' && 'Bạn chưa mượn cuốn sách nào. Hãy khám phá thư viện ngay!'}
            {activeTab === 'returned' && 'Bạn chưa trả cuốn sách nào.'}
            {activeTab === 'overdue' && 'Tuyệt vời! Bạn không có sách quá hạn nào.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">explore</span>
            Khám phá thư viện
          </Link>
        </div>
      )}
    </div>
  );
}
