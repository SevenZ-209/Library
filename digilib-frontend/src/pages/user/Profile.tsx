import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { bookService } from '@/services/book.service';
import { Badge } from '@/components/ui/Badge';
import type { BorrowRecord } from '@/types/book.types';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  
  const [myRecords, setMyRecords] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyRecords = async () => {
      try {
        const data: any = await bookService.getAllBorrowRecords();
        // API tự động chỉ trả về sách của user đang đăng nhập
        setMyRecords(Array.isArray(data) ? data : (data.results || []));
      } catch {
        addToast('Không thể tải lịch sử mượn sách', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRecords();
  }, [user, navigate, addToast]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 pb-32">
      {/* KHU VỰC 1: THÔNG TIN CÁ NHÂN */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-8 border border-outline-variant/30">
        <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center shadow-inner">
          <span className="text-4xl text-primary font-bold uppercase">
            {user.first_name?.[0] || user.username[0]}
          </span>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-headline font-extrabold text-on-surface">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-on-surface-variant mt-1">@{user.username}</p>
          <div className="mt-4 inline-block px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-bold capitalize">
            Vai trò: {user.role === 'reader' ? 'Độc giả' : user.role === 'librarian' ? 'Thủ thư' : 'Admin'}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          {(user.role === 'admin' || user.role === 'librarian') && (
            <button
              onClick={() => navigate('/admin')}
              className="px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Vào Không gian làm việc
            </button>
          )}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-6 py-3 rounded-full bg-error/10 text-error font-bold hover:bg-error/20 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* KHU VỰC 2: LỊCH SỬ MƯỢN SÁCH - CHỈ HIỆN CHO ĐỘC GIẢ */}
      {user.role === 'reader' && (
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30">
          <h2 className="font-headline font-extrabold text-xl text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">menu_book</span>
            Sách tôi đang mượn
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-on-surface-variant animate-pulse">Đang tải dữ liệu...</div>
        ) : myRecords.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">auto_stories</span>
            <p>Bạn chưa mượn cuốn sách nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Mã Phiếu</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Ngày mượn</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Hạn trả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {myRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">#{record.id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">
                      {new Date(record.borrow_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        record.status === 'pending' ? 'warning' : 
                        record.status === 'borrowed' ? 'primary' : 
                        record.status === 'returned' ? 'success' : 
                        record.status === 'cancelled' ? 'default' : 'error'
                      }>
                        {record.status === 'pending' ? 'Chờ ra quầy nhận' :
                         record.status === 'borrowed' ? 'Đang mượn' :
                         record.status === 'returned' ? 'Đã trả' :
                         record.status === 'cancelled' ? 'Bị hủy' : 'Quá hạn (Cần trả ngay)'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface-variant">
                      {new Date(record.due_date).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

    </div>
  );
}