import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-container text-on-surface-variant',
    primary: 'bg-primary text-on-primary',
    secondary: 'bg-secondary-container text-on-secondary-container',
    tertiary: 'bg-tertiary text-on-tertiary',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-error-container text-on-error-container',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-widest rounded font-[family-name:var(--font-label)]',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
