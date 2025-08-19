import { Button } from '@/components/ui/button';

export type FilterType = 'all' | 'todo' | 'progress' | 'done';

interface CategoryFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: 'default' },
  { key: 'todo', label: 'To-Do', color: 'destructive' },
  { key: 'progress', label: 'Progress', color: 'secondary' },
  { key: 'done', label: 'Done', color: 'default' },
];

export default function CategoryFilters({ activeFilter, onFilterChange }: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className={
            activeFilter === filter.key
              ? filter.key === 'todo'
                ? 'bg-accent-red hover:bg-accent-red/90'
                : filter.key === 'progress'
                ? 'bg-accent-yellow hover:bg-accent-yellow/90'
                : filter.key === 'done'
                ? 'bg-accent-green hover:bg-accent-green/90'
                : ''
              : ''
          }
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}