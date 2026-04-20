import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-error-container border-red-200 text-on-error-container',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-surface-container border-outline-variant text-on-surface',
  };

  const iconStyles = {
    success: 'text-green-600',
    error: 'text-error',
    warning: 'text-amber-600',
    info: 'text-primary',
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:left-auto md:right-8 md:w-96">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm pointer-events-auto animate-slide-up',
            styles[toast.type]
          )}
        >
          <span
            className={cn('material-symbols-outlined text-xl', iconStyles[toast.type])}
          >
            {icons[toast.type]}
          </span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
