import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';
import styles from './Header.module.css';

export function Header() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/collections', label: 'Bộ sưu tập' },
    { href: '/my-archive', label: 'Tủ sách của tôi' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link
          to="/"
          className={styles.logo}
        >
          DigiLib
        </Link>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                location.pathname === link.href ? styles.navLinkActive : styles.navLinkInactive
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {isAuthenticated && user && <NotificationDropdown />}

          {isAuthenticated && user && (user.role === 'admin' || user.role === 'librarian') && (
            <Link
              to="/admin"
              className={styles.adminButton}
            >
              <span className={cn("material-symbols-outlined", styles.adminIcon)}>admin_panel_settings</span>
              Trang Quản Trị
            </Link>
          )}

          {isAuthenticated && user ? (
            <Link
              to="/profile"
              className={styles.profileButton}
            >
              <span className={cn("material-symbols-outlined", styles.profileIcon)}>
                account_circle
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className={styles.loginButton}
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
