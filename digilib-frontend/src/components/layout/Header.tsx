import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/collections', label: 'Bộ sưu tập' },
    { href: '/manuscripts', label: 'Tài liệu' },
    { href: '/exhibits', label: 'Triển lãm' },
    { href: '/my-archive', label: 'Tủ sách của tôi' },
  ];

  return (
    <header className="glass-header fixed top-0 z-50 w-full" style={{ viewTransitionName: 'site-header' }}>
      <div className="flex justify-between items-center px-8 h-20 max-w-screen-2xl mx-auto">
        {/* Brand Logo */}
        <Link
          to="/"
          className="text-2xl font-headline font-extrabold tracking-tighter text-primary hover:opacity-80 transition-opacity"
        >
          DigiLib
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'font-headline text-sm font-semibold tracking-tight transition-all duration-300 pb-1',
                location.pathname === link.href
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface/60 hover:text-on-surface hover:bg-teal-50/50 px-3 py-1 rounded-lg'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Thông báo"
            className="p-2 rounded-full hover:bg-teal-50/50 transition-all duration-300 text-primary active:scale-95"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>

          {isAuthenticated && user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 rounded-full border-2 border-primary/20 hover:border-primary transition-all duration-300"
            >
              <span className="material-symbols-outlined text-3xl text-primary">
                {user.avatar ? 'account_circle' : 'account_circle'}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn-gradient px-5 py-2 rounded-full text-sm font-semibold font-[family-name:var(--font-label)]"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
