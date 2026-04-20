import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-container-lowest rounded-xl p-4 transition-all duration-300',
        hover && 'hover:scale-[1.02] hover:shadow-lg cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
