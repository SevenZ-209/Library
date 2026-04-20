import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '@/components/ui/Toast';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main
        className="flex-1 pt-20 pb-24 md:pb-12"
        style={{ viewTransitionName: 'page-content' }}
      >
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
