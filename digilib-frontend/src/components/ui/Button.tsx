import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-label)]';

    const variants = {
      primary: 'btn-gradient hover:scale-[1.02] active:scale-[0.98]',
      secondary:
        'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80',
      tertiary:
        'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim',
      ghost:
        'bg-transparent text-on-surface hover:bg-surface-container-high',
      danger:
        'bg-error text-on-error hover:bg-error/90',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin text-sm">
            progress_activity
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
