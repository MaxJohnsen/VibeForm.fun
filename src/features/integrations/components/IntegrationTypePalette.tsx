import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';
import { IntegrationType } from '../api/integrationsApi';
import { cn } from '@/lib/utils';

interface IntegrationTypePaletteProps {
  onSelectType: (type: IntegrationType) => void;
  className?: string;
}

export const IntegrationTypePalette = ({ onSelectType, className }: IntegrationTypePaletteProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTypes = INTEGRATION_TYPES.filter((type) =>
    type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("w-64 border-r border-border/50 glass-panel overflow-y-auto", className)}>
      <div className="p-6 pb-4 sticky top-0 glass-panel border-b border-border/50 z-10">
        <h2 className="font-semibold text-lg mb-1">Integrations</h2>
        <p className="text-xs text-muted-foreground mb-4">Click to create a new action</p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-background/50"
          />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {filteredTypes.length > 0 ? (
          filteredTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.type}
                onClick={() => onSelectType(type.type)}
                className="w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'rounded-lg p-2 bg-muted/50 transition-colors',
                    type.color
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">
                      {type.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {type.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No integrations found
          </div>
        )}
      </div>
    </div>
  );
};
