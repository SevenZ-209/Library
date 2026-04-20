import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  trend?: { value: number; isPositive: boolean };
  color?: 'primary' | 'success' | 'warning' | 'error';
  index?: number;
  iconName?: string;
}

export function StatsCard({
  title,
  value,
  trend,
  color = 'primary',
  index = 0,
  iconName = 'book_2',
}: StatsCardProps) {
  const colorMap = {
    primary: 'bg-secondary-container text-primary group-hover:bg-primary group-hover:text-white',
    success: 'bg-green-50 text-green-700 group-hover:bg-green-700 group-hover:text-white',
    warning: 'bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white',
    error: 'bg-error-container text-error group-hover:bg-error group-hover:text-white',
  };

  return (
    <div
      className="bg-surface-container-lowest p-6 rounded-xl transition-all duration-300 hover:scale-[1.02] group"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards',
        opacity: 0,
      }}
    >
      <div className="flex justify-between items-start">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300',
            colorMap[color]
          )}
        >
          <span className="material-symbols-outlined">{iconName}</span>
        </div>
        {trend && (
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-1 rounded-full',
              trend.isPositive ? 'text-teal-600 bg-teal-50' : 'text-error bg-error-container/20'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}% mo/mo
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-label)]">
          {title}
        </p>
        <p className="text-3xl font-headline font-extrabold text-on-surface mt-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}
