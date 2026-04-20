import { StatsCard } from '@/components/admin/StatsCard';

interface DashboardStats {
  total_books: number;
  borrowed_books: number;
  overdue_books: number;
  active_users?: number;
}

interface StatsGridProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-xl animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-surface-container rounded-xl" />
              <div className="w-16 h-6 bg-surface-container rounded-full" />
            </div>
            <div className="h-3 w-24 bg-surface-container rounded mb-2" />
            <div className="h-8 w-16 bg-surface-container rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Tổng Số Sách"
        value={stats?.total_books ?? 0}
        iconName="book_2"
        color="primary"
        index={0}
      />
      <StatsCard
        title="Đang Mượn"
        value={stats?.borrowed_books ?? 0}
        iconName="handshake"
        color="warning"
        index={1}
      />
      <StatsCard
        title="Quá Hạn"
        value={stats?.overdue_books ?? 0}
        iconName="warning"
        color="error"
        index={2}
      />
      <StatsCard
        title="Số Độc Giả"
        value={stats?.active_users ?? 0}
        iconName="group"
        color="success"
        index={3}
      />
    </div>
  );
}
