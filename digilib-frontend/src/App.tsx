import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

import HomePage from '@/pages/home';
import CollectionsPage from '@/pages/collections/Collections';
import CollectionDetailPage from '@/pages/collections/CollectionDetail';
import BookDetailPage from '@/pages/books/BookDetail';
import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';
import ProfilePage from '@/pages/user/Profile';
import MyArchivePage from '@/pages/user/MyArchive';
import NotFoundPage from '@/pages/error/NotFound';
import DashboardPage from '@/pages/admin/Dashboard';
import ManageBooksPage from '@/pages/admin/ManageBooks';
import ManageBorrowRecordsPage from '@/pages/admin/ManageBorrowRecords';

import '@/styles/view-transitions.css';
import '@/styles/animations.css';
import '@/styles/global.css';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Main Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:id" element={<CollectionDetailPage />} />
            <Route path="/my-archive" element={<MyArchivePage />} />
            <Route path="/search" element={<HomePage />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin', 'librarian']}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="books" element={<ManageBooksPage />} />
            <Route path="borrows" element={<ManageBorrowRecordsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
