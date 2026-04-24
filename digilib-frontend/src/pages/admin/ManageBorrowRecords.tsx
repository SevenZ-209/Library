import { useState, useEffect } from 'react';
import { bookService } from '@/services/book.service';
import type { BorrowRecord } from '@/types/book.types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { Loader2 } from 'lucide-react';

export default function ManageBorrowRecords() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useUIStore();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await bookService.getAllBorrowRecords();
      setRecords(data.results || []);
    } catch (error) {
      addToast('Không thể tải danh sách phiếu mượn', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleConfirmPickup = async (id: number) => {
    setProcessingId(id);
    try {
      await bookService.confirmPickup(id);
      addToast('Xác nhận giao sách thành công', 'success');
      await fetchRecords();
    } catch (error: any) {
      addToast(error.response?.data?.detail || 'Lỗi khi xác nhận giao sách', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReturnBook = async (id: number) => {
    setProcessingId(id);
    try {
      await bookService.returnBook(id);
      addToast('Duyệt trả sách thành công', 'success');
      await fetchRecords();
    } catch (error: any) {
      addToast(error.response?.data?.detail || 'Lỗi khi duyệt trả sách', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRecords = records.filter(record => {
    const nameMatch = (record.borrower_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = record.id.toString().includes(searchTerm);
    return nameMatch || idMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline text-gray-900">Quản lý Mượn/Trả sách</h1>
        <Button onClick={fetchRecords} variant="secondary" size="sm">
          Làm mới
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold text-lg">Danh sách phiếu mượn</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm tên hoặc mã phiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã phiếu</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Độc giả</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sách</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hạn trả</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Không có phiếu mượn nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-600">#{record.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{record.borrower_name}</div>
                      <div className="text-xs text-gray-500">{record.borrower_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={record.book_title}>
                        {record.book_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(record.due_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge
                        variant={
                          record.status === 'returned'
                            ? 'success'
                            : record.status === 'overdue'
                            ? 'error'
                            : record.status === 'pending'
                            ? 'secondary'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {record.status === 'returned'
                          ? 'Đã trả'
                          : record.status === 'overdue'
                          ? 'Quá hạn'
                          : record.status === 'pending'
                          ? 'Chờ duyệt'
                          : 'Đang mượn'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {record.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleConfirmPickup(record.id)}
                          disabled={processingId === record.id}
                        >
                          {processingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Giao sách'}
                        </Button>
                      )}
                      {(record.status === 'borrowed' || record.status === 'overdue') && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleReturnBook(record.id)}
                          disabled={processingId === record.id}
                        >
                          {processingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Duyệt trả'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
