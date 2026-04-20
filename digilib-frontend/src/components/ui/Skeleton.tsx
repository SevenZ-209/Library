import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-xl',
        className
      )}
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 animate-pulse">
      <Skeleton className="aspect-[3/4] rounded-lg mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
      <Skeleton className="h-12 w-full rounded-full mt-4" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </td>
      <td className="px-8 py-5"><Skeleton className="h-4 w-40 rounded" /></td>
      <td className="px-8 py-5"><Skeleton className="h-4 w-24 rounded" /></td>
      <td className="px-8 py-5"><Skeleton className="h-4 w-20 rounded" /></td>
      <td className="px-8 py-5"><Skeleton className="h-6 w-16 rounded-full" /></td>
    </tr>
  );
}
