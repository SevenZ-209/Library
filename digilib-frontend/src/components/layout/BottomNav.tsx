import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: 'home', label: 'Trang chủ' },
  { path: '/collections', icon: 'grid_view', label: 'Bộ sưu tập' },
  { path: '/my-archive', icon: 'book_4', label: 'Tủ sách', isArchive: true },
  { path: '/search', icon: 'search', label: 'Tìm kiếm' },
  { path: '/profile', icon: 'person', label: 'Tài khoản' },
];

export function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-lg md:hidden">
      <div className="flex justify-around items-center px-4 pt-3 pb-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isArchive = item.isArchive;

          return (
            <Link
              key={item.path}
              to={
                isAuthenticated || item.path !== '/profile'
                  ? item.path
                  : '/login'
              }
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative',
                isArchive && isActive
                  ? 'bg-secondary-container rounded-full px-5 py-1.5 text-primary'
                  : isActive
                    ? 'text-primary scale-110 font-bold'
                    : 'text-on-surface/40 hover:text-on-surface/70'
              )}
            >
              <span
                className="material-symbols-outlined mb-1"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400",
                }}
              >
                {item.icon}
              </span>
              <span className="text-[11px] tracking-wide uppercase font-[family-name:var(--font-label)]">
                {item.label}
              </span>
              {isActive && !isArchive && (
                <div className="absolute top-0 w-12 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
