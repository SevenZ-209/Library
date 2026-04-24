import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { bookService } from '@/services/book.service';
import { StatsGrid } from '@/components/admin/StatsGrid';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DashboardStats } from '@/types/book.types';

export default function DashboardPage() {
  const { addToast } = useUIStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const statsData = await bookService.getDashboardStats();
      setStats(statsData);

    } catch {
      addToast('Không thể tải dữ liệu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="font-headline font-extrabold text-3xl text-on-surface">Tổng quan Thư viện</h2>
      </div>

      <StatsGrid stats={stats} isLoading={isLoading} />

      <div className="bg-surface-container-low p-8 rounded-xl h-96">
        <h3 className="font-headline font-extrabold text-xl mb-6">Biểu đồ mượn sách</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats?.chart_data || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip cursor={{ fill: 'rgba(0,104,95,0.1)' }} />
            <Bar dataKey="borrows" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}