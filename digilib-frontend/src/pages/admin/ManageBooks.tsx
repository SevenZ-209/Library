import { useAuthStore } from '@/stores/authStore';

export default function ManageBooksPage() {
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin' || user?.role === 'librarian';

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">lock</span>
        <h2 className="text-xl font-headline font-bold text-on-surface">Truy cập bị từ chối</h2>
        <p className="text-on-surface-variant mt-2">Bạn không có quyền quản lý sách.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
            Quản lý Sách
          </h2>
          <p className="text-on-surface-variant mt-1">
            Thêm, sửa, hoặc xóa sách khỏi bộ sưu tập.
          </p>
        </div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>
            add
          </span>
          Thêm sách mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <div className="p-8 border-b border-outline-variant/30">
          <h3 className="font-headline font-extrabold text-xl">Tất cả sách</h3>
        </div>
        <div className="p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-4 block">menu_book</span>
          <p className="text-on-surface-variant">
            Kết nối với backend API để xem và quản lý sách.
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            Endpoint: GET /api/book/
          </p>
        </div>
      </div>
    </div>
  );
}
