import { ReactNode, useState } from 'react';
import { Search, LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaletteItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  colorClass?: string;
}

export interface SidebarPaletteProps {
  title: string;
  subtitle?: string;
  items: PaletteItem[];
  onSelect: (id: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  /** Custom item renderer for special cases like draggable items */
  renderItem?: (item: PaletteItem, defaultRender: ReactNode) => ReactNode;
  /** Disable all interactions */
  disabled?: boolean;
}

export const SidebarPalette = ({
  title,
  subtitle,
  items,
  onSelect,
  searchable = false,
  searchPlaceholder = 'Search...',
  className,
  renderItem,
  disabled = false,
}: SidebarPaletteProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchable
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <div className={cn(
      "border-r border-border bg-card h-full overflow-y-auto transition-opacity",
      disabled && "opacity-50 pointer-events-none",
      className
    )}>
      {/* Header */}
      <div className="p-6 pb-4 sticky top-0 bg-card border-b border-border z-10">
        <h2 className="font-semibold text-lg mb-1 font-heading">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
        )}
        
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-4 space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const Icon = item.icon;
            const defaultElement = (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onSelect(item.id)}
                className="w-full h-auto text-left p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group justify-start"
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={cn(
                    'rounded-lg p-2 transition-colors',
                    item.colorClass || 'bg-secondary'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-normal">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            );

            return renderItem ? renderItem(item, defaultElement) : defaultElement;
          })
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No items found
          </div>
        )}
      </div>
    </div>
  );
};