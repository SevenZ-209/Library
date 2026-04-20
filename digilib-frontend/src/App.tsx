import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

import HomePage from '@/pages/Home';
import BookDetailPage from '@/pages/BookDetail';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import ProfilePage from '@/pages/Profile';
import NotFoundPage from '@/pages/NotFound';
import DashboardPage from '@/pages/admin/Dashboard';
import ManageBooksPage from '@/pages/admin/ManageBooks';

import '@/styles/view-transitions.css';
import '@/styles/animations.css';
import '@/index.css';

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
            <Route path="/collections" element={<HomePage />} />
            <Route path="/manuscripts" element={<HomePage />} />
            <Route path="/exhibits" element={<HomePage />} />
            <Route path="/my-archive" element={<HomePage />} />
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
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
