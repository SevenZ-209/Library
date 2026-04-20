import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { path: '/admin/books', icon: 'menu_book', label: 'Books' },
  { path: '/admin/users', icon: 'group', label: 'Users', adminOnly: true },
];

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-teal-50 flex flex-col py-8 px-4 border-r border-teal-100/10 fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              library_books
            </span>
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-2xl text-teal-900 tracking-tight">
              DigiLib
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-teal-700/60 font-bold font-[family-name:var(--font-label)]">
              The Curated Archive
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-[family-name:var(--font-label)]',
                  isActive
                    ? 'bg-white text-teal-700 font-bold border-r-4 border-primary translate-x-1 shadow-sm'
                    : 'text-slate-600 hover:text-teal-600 hover:bg-teal-100/50'
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined transition-transform duration-200',
                    !isActive && 'group-hover:translate-x-1'
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto pt-6 border-t border-teal-100/20 space-y-1">
          <Link
            to="/support"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-teal-100/50 transition-all duration-200"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm font-medium font-[family-name:var(--font-label)]">Support</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/5 transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium font-[family-name:var(--font-label)]">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-teal-50/85 backdrop-blur-xl flex justify-between items-center w-full px-8 py-4 border-b border-teal-100/50">
          <div className="flex items-center gap-2">
            <span className="text-teal-700 font-headline font-bold text-lg">DigiLib Admin</span>
            <span className="w-1 h-1 rounded-full bg-teal-300" />
            <span className="text-slate-500 font-medium text-sm font-[family-name:var(--font-label)]">
              {location.pathname === '/admin' ? 'Overview' : location.pathname.replace('/admin/', '').charAt(0).toUpperCase() + location.pathname.replace('/admin/', '').slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Quick find resources..."
                className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none font-[family-name:var(--font-body)]"
              />
            </div>

            {/* User info */}
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-teal-50 transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-teal-50" />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-teal-50 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-teal-100/50">
                <div className="text-right">
                  <p className="text-xs font-bold text-teal-900 leading-none font-[family-name:var(--font-label)]">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 capitalize font-[family-name:var(--font-label)]">
                    {user?.role || 'System Admin'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
