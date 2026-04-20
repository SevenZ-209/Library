import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'Vui lòng nhập họ'),
    last_name: z.string().min(1, 'Vui lòng nhập tên'),
    username: z
      .string()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ chứa chữ cái, số và dấu gạch dưới'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();
  const [showPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    clearError();
    try {
      await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        password: data.password,
      });
      addToast('Đăng ký thành công!', 'success');
      navigate('/');
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface tracking-[-0.02em]">
          Tạo tài khoản mới
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Bắt đầu hành trình khám phá thư viện số của bạn.
        </p>
      </header>

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1 font-[family-name:var(--font-label)]">
              Họ
            </label>
            <div className="relative group">
              <input
                {...register('first_name')}
                type="text"
                className="w-full bg-surface-container-highest px-4 py-3.5 rounded-lg text-on-surface placeholder:text-outline/50 border-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#006a61] transition-all duration-300 font-[family-name:var(--font-body)]"
                placeholder="Nguyễn"
              />
            </div>
            {errors.first_name && (
              <p className="text-error text-[10px] mt-1 ml-1">{errors.first_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1 font-[family-name:var(--font-label)]">
              Tên
            </label>
            <div className="relative group">
              <input
                {...register('last_name')}
                type="text"
                className="w-full bg-surface-container-highest px-4 py-3.5 rounded-lg text-on-surface placeholder:text-outline/50 border-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#006a61] transition-all duration-300 font-[family-name:var(--font-body)]"
                placeholder="Văn A"
              />
            </div>
            {errors.last_name && (
              <p className="text-error text-[10px] mt-1 ml-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1 font-[family-name:var(--font-label)]">
            Tên đăng nhập
          </label>
          <div className="relative group">
            <input
              {...register('username')}
              type="text"
              className="w-full bg-surface-container-highest px-4 py-3.5 rounded-lg text-on-surface placeholder:text-outline/50 border-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#006a61] transition-all duration-300 font-[family-name:var(--font-body)]"
              placeholder="nguyenvana88"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 group-focus-within:text-primary transition-colors">
              alternate_email
            </span>
          </div>
          {errors.username && (
            <p className="text-error text-[10px] mt-1 ml-1">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1 font-[family-name:var(--font-label)]">
            Địa chỉ Email
          </label>
          <div className="relative group">
            <input
              {...register('email')}
              type="email"
              className="w-full bg-surface-container-highest px-4 py-3.5 rounded-lg text-on-surface placeholder:text-outline/50 border-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#006a61] transition-all duration-300 font-[family-name:var(--font-body)]"
              placeholder="nguyenvana@email.com"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 group-focus-within:text-primary transition-colors">
              mail
            </span>
          </div>
          {errors.email && (
            <p className="text-error text-[10px] mt-1 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1 font-[family-name:var(--font-label)]">
            Mật khẩu
          </label>
          <div className="relative group">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-surface-container-highest px-4 py-3.5 rounded-lg text-on-surface placeholder:text-outline/50 border-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#006a61] transition-all duration-300 font-[family-name:var(--font-body)]"
              placeholder="••••••••"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 group-focus-within:text-primary transition-colors">
              lock
            </span>
          </div>
          <p className="text-[10px] text-outline ml-1">
            Tối thiểu 8 ký tự, bao gồm chữ và số.
          </p>
          {errors.password && (
            <p className="text-error text-[10px] mt-1 ml-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1 font-[family-name:var(--font-label)]">
            Xác nhận mật khẩu
          </label>
          <div className="relative group">
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-surface-container-highest px-4 py-3.5 rounded-lg text-on-surface placeholder:text-outline/50 border-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#006a61] transition-all duration-300 font-[family-name:var(--font-body)]"
              placeholder="••••••••"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 group-focus-within:text-primary transition-colors">
              lock
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="text-error text-[10px] mt-1 ml-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* CTA */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-gradient py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-transform duration-200 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-headline)]"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Đang tạo...
              </>
            ) : (
              <>
                Đăng Ký
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Alternative Action */}
      <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
        <p className="text-sm text-on-surface-variant">
          Bạn đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-primary font-bold hover:underline underline-offset-4"
          >
            Đăng nhập
          </Link>
        </p>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">verified_user</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Truy cập bảo mật</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">encrypted</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Bảo mật dữ liệu</span>
        </div>
      </div>
    </div>
  );
}
