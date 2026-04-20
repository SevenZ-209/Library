import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = 'folder_open',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 text-center px-4',
        className
      )}
    >
      <span className="material-symbols-outlined text-6xl text-outline mb-4">
        {icon}
      </span>
      <h3 className="text-lg font-headline font-bold text-on-surface mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-on-surface-variant text-sm max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
