import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();
    try {
      await login(data.username, data.password);
      addToast('Đăng nhập thành công!', 'success');
      navigate('/');
    } catch {
      // Error already in store
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-headline font-bold text-on-surface tracking-[-0.02em] mb-2">
          Chào Mừng Quay Lại
        </h2>
        <p className="text-on-surface-variant font-medium">
          Vui lòng nhập thông tin để truy cập bộ sưu tập của bạn.
        </p>
      </header>

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">
            Tên đăng nhập
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-xl">
              person
            </span>
            <input
              {...register('username')}
              type="text"
              className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline-variant input-focus transition-all duration-300 font-[family-name:var(--font-body)]"
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          {errors.username && (
            <p className="text-error text-xs mt-1">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-label)]">
              Mật khẩu
            </label>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-xl">
              lock
            </span>
            <input
              {...register('password')}
              type="password"
              className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline-variant input-focus transition-all duration-300 font-[family-name:var(--font-body)]"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-error text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between py-2">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 bg-surface-container-highest rounded-lg peer-checked:bg-primary transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-sm opacity-0 peer-checked:opacity-100">
                  check
                </span>
              </div>
            </div>
            <span className="ml-3 text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors font-[family-name:var(--font-label)]">
              Ghi nhớ đăng nhập
            </span>
          </label>
          <a
            href="#"
            className="text-sm font-semibold text-primary hover:text-primary-container transition-colors duration-300 underline-offset-4 hover:underline font-[family-name:var(--font-label)]"
          >
            Quên mật khẩu?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-gradient py-4 rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
              Đang xác thực...
            </>
          ) : (
            <>
              Đăng Nhập
              <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>

      <footer className="mt-12 text-center">
        <p className="text-on-surface-variant font-medium">
          Bạn chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-primary font-bold ml-1 hover:underline underline-offset-4 transition-all"
          >
            Tạo tài khoản
          </Link>
        </p>
      </footer>
    </div>
  );
}
