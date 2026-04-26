import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '@/components/ui/Toast';
import styles from './MainLayout.module.css';

export function MainLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
