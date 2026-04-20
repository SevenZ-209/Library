import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { bookService } from '@/services/book.service';
import { StatsGrid } from '@/components/admin/StatsGrid';
import { Badge } from '@/components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DashboardStats, BorrowRecord } from '@/types/book.types';

export default function DashboardPage() {
  const { addToast } = useUIStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, recordsData] = await Promise.all([
        bookService.getDashboardStats(),
        bookService.getAllBorrowRecords()
      ]);
      setStats(statsData);
      
      const data: any = recordsData; 
      const finalRecords = Array.isArray(data) ? data : (data.results || []);
      setRecords(finalRecords);

    } catch {
      addToast('Không thể tải dữ liệu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmPickup = async (id: number) => {
    try {
      await bookService.confirmPickup(id);
      addToast('Đã xác nhận giao sách!', 'success');
      fetchData();
    } catch {
      addToast('Lỗi khi xác nhận giao sách', 'error');
    }
  };

  const handleReturnBook = async (id: number) => {
    try {
      await bookService.returnBook(id);
      addToast('Đã nhận lại sách thành công!', 'success');
      fetchData();
    } catch {
      addToast('Lỗi khi nhận trả sách', 'error');
    }
  };

  // Logic lọc dữ liệu dựa trên từ khóa tìm kiếm (Tìm theo Tên hoặc Mã phiếu)
  const filteredRecords = records.filter(record => {
    const nameMatch = (record.borrower_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = record.id.toString().includes(searchTerm);
    return nameMatch || idMatch;
  });

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

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        {/* Phần Header của bảng có thêm thanh tìm kiếm */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-headline font-extrabold text-xl">Quản lý phiếu mượn</h3>
          
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm tên hoặc mã phiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-outline-variant/30 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Mã phiếu</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Người mượn</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Ngày mượn</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Ngày hạn/trả</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low/50">
                  <td className="px-6 py-4 font-mono text-sm">#{row.id}</td>

              
                  
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-on-surface">{row.borrower_name || 'Khách'}</p>
                    {row.borrower_phone && (
                      <p className="text-xs text-on-surface-variant mt-0.5">{row.borrower_phone}</p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                    {new Date(row.borrow_date).toLocaleDateString('vi-VN')}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {new Date(row.due_date).toLocaleDateString('vi-VN')}
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant={
                      row.status === 'pending' ? 'warning' : 
                      row.status === 'borrowed' ? 'primary' : 
                      row.status === 'returned' ? 'success' : 
                      row.status === 'cancelled' ? 'default' : 'error'
                    }>
                      {row.status === 'pending' ? 'Chờ nhận' :
                       row.status === 'borrowed' ? 'Đang mượn' :
                       row.status === 'returned' ? 'Đã trả' :
                       row.status === 'cancelled' ? 'Đã hủy' : 'Quá hạn'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {row.status === 'pending' && (
                      <button onClick={() => handleConfirmPickup(row.id)} className="bg-amber-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm">
                        Giao sách
                      </button>
                    )}
                    {row.status === 'borrowed' && (
                      <button onClick={() => handleReturnBook(row.id)} className="bg-primary text-white px-3 py-1 rounded text-xs font-bold hover:bg-primary-container transition-colors shadow-sm">
                        Nhận trả
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                  Không tìm thấy phiếu mượn nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}