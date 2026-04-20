import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-screen-2xl mx-auto px-8 pt-28 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 text-center mb-8">
          <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-headline font-bold text-primary">
              {user.first_name[0]}{user.last_name[0]}
            </span>
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-on-surface-variant mt-1">@{user.username}</p>
          <span className="inline-block mt-3 px-4 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider capitalize">
            {user.role}
          </span>
        </div>

        {/* Info */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4 mb-8">
          <h3 className="font-headline font-bold text-lg text-on-surface">Thông tin tài khoản</h3>
          <div className="flex justify-between py-3 border-b border-outline-variant/20">
            <span className="text-on-surface-variant text-sm">Tên đăng nhập</span>
            <span className="text-on-surface font-medium text-sm">@{user.username}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-outline-variant/20">
            <span className="text-on-surface-variant text-sm">Email</span>
            <span className="text-on-surface font-medium text-sm">{user.username}@example.com</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-on-surface-variant text-sm">Vai trò</span>
            <span className="text-on-surface font-medium text-sm capitalize">{user.role}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full py-3 rounded-full bg-error text-white font-bold hover:bg-error/90 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
