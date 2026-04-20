import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { bookService } from '@/services/book.service';
import { StatsGrid } from '@/components/admin/StatsGrid';
import type { DashboardStats } from '@/types/book.types';

export default function DashboardPage() {
  const { addToast } = useUIStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bookService
      .getDashboardStats()
      .then(setStats)
      .catch(() => addToast('Không thể tải dữ liệu dashboard', 'error'))
      .finally(() => setIsLoading(false));
  }, [addToast]);

  const recentActivity = [
    { user: 'Nguyễn Văn A', userId: 'NVA', book: 'Số đỏ', borrowDate: '18/04/2024', dueDate: '02/05/2024', status: 'Đúng hạn' },
    { user: 'Trần Thị B', userId: 'TTB', book: 'Tắt đèn', borrowDate: '10/04/2024', dueDate: '24/04/2024', status: 'Quá hạn' },
    { user: 'Lê Văn C', userId: 'LVC', book: 'Truyện Kiều', borrowDate: '01/04/2024', dueDate: '15/04/2024', status: 'Đã trả' },
  ];

  const statusBadgeStyle: Record<string, string> = {
    'Đúng hạn': 'bg-teal-100 text-teal-700',
    'Quá hạn': 'bg-error-container text-error',
    'Đã trả': 'bg-surface-container-highest text-on-surface-variant',
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
            Tổng quan Thư viện
          </h2>
          <p className="text-on-surface-variant mt-1">
            Số liệu thống kê từ bộ sưu tập của bạn.
          </p>
        </div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>
            add
          </span>
          Thêm tài liệu mới
        </button>
      </div>

      <StatsGrid stats={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart */}
        <div className="lg:col-span-8 bg-surface-container-low p-8 rounded-xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-headline font-extrabold text-xl">Thống kê mượn sách theo tháng</h3>
              <p className="text-sm text-on-surface-variant">Phân tích hiệu suất năm 2024</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-primary shadow-sm font-[family-name:var(--font-label)]">
                Theo tháng
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-white transition-colors font-[family-name:var(--font-label)]">
                Theo tuần
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between h-64 px-4 relative">
            <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between pointer-events-none border-l border-b border-teal-100/30">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-t border-teal-100/10" />
              ))}
            </div>
              {[
                { month: 'T1', height: 'h-32', value: '2,100', opacity: 'bg-primary/20' },
                { month: 'T2', height: 'h-44', value: '2,850', opacity: 'bg-primary/40' },
                { month: 'T3', height: 'h-36', value: '2,400', opacity: 'bg-primary/60' },
                { month: 'T4', height: 'h-52', value: '3,400', opacity: 'bg-primary/80' },
                { month: 'T5', height: 'h-48', value: '3,100', opacity: 'bg-primary/90' },
                { month: 'T6', height: 'h-60', value: '4,000', opacity: 'bg-primary' },
              ].map((bar) => (
              <div key={bar.month} className="relative group flex flex-col items-center gap-4 w-full">
                <div
                  className={`w-12 ${bar.opacity} hover:bg-primary transition-all duration-500 rounded-t-lg ${bar.height} relative`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-white text-[10px] py-1 px-2 rounded font-[family-name:var(--font-label)]">
                    {bar.value}
                  </div>
                </div>
                <span className={`text-[10px] font-bold font-[family-name:var(--font-label)] ${bar.month === 'JUN' ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Picks */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-teal-50/10">
          <h3 className="font-headline font-extrabold text-xl mb-6">Sách nổi bật</h3>
          <div className="space-y-6">
            {[
              { title: 'Kiến trúc thuật', author: 'S. J. Jenkins', rating: '4.9', views: '240' },
              { title: 'Thực vật & Phong tục', author: 'Evelyn Reed', rating: '4.7', views: '180' },
              { title: 'Đại dương kỳ thú', author: 'Capt. Arthur Hall', rating: '4.8', views: '310' },
            ].map((pick, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="w-16 h-20 rounded-lg bg-teal-100 overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary-container to-primary/10">
                    <span className="material-symbols-outlined text-primary/40">menu_book</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface leading-tight group-hover:text-primary transition-colors">
                    {pick.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1">{pick.author}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant font-[family-name:var(--font-label)]">
                      {pick.rating} ({pick.views} views)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-surface-container text-primary font-bold text-xs hover:bg-primary hover:text-white transition-all font-[family-name:var(--font-label)]">
            Xem tất cả
          </button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-teal-50/50">
          <h3 className="font-headline font-extrabold text-xl">Hoạt động gần đây</h3>
          <button className="text-primary text-xs font-bold flex items-center gap-1 font-[family-name:var(--font-label)]">
            Xem lịch sử đầy đủ
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Người dùng', 'Sách', 'Ngày mượn', 'Hạn trả', 'Trạng thái', ''].map((h) => (
                  <th key={h} className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50/50">
              {recentActivity.map((row, i) => (
                <tr key={i} className="group hover:bg-teal-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-bold text-xs text-primary">
                        {row.userId}
                      </div>
                      <p className="text-sm font-bold text-on-surface">{row.user}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-on-surface">{row.book}</td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">{row.borrowDate}</td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">{row.dueDate}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBadgeStyle[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">
                      more_vert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
