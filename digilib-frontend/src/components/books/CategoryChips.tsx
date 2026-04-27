import type { Category } from '@/types/book.types';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  const allLabel = 'All Curations';

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'px-5 py-2 rounded-full font-[family-name:var(--font-label)] text-sm font-medium transition-all duration-300',
          selected === null
            ? 'bg-primary text-on-primary shadow-md'
            : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest'
        )}
      >
        {allLabel}
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'px-5 py-2 rounded-full font-[family-name:var(--font-label)] text-sm font-medium transition-all duration-300',
            selected === cat.id
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
