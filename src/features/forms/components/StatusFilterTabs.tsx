import { cn } from '@/lib/utils';
import { Form } from '../api/formsApi';

type FilterType = 'all' | 'active' | 'draft' | 'archived';

interface StatusFilterTabsProps {
  forms: Form[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Forms' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

export const StatusFilterTabs = ({ forms, activeFilter, onFilterChange }: StatusFilterTabsProps) => {
  const getCounts = (status: FilterType) => {
    if (status === 'all') return forms.length;
    return forms.filter((f) => f.status === status).length;
  };

  return (
    <div className="flex flex-col gap-1">
      {filters.map((filter) => {
        const count = getCounts(filter.value);
        const isActive = activeFilter === filter.value;
        
        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left',
              isActive 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>{filter.label}</span>
            <span className={cn(
              'text-xs tabular-nums',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
