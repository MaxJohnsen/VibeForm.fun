import { Plus } from 'lucide-react';
import { IntegrationTypeInfo } from '../constants/integrationTypes';
import { Button } from '@/components/ui/button';

interface AvailableIntegrationCardProps {
  typeInfo: IntegrationTypeInfo;
  onSetup: () => void;
}

export const AvailableIntegrationCard = ({ typeInfo, onSetup }: AvailableIntegrationCardProps) => {
  const Icon = typeInfo.icon;

  return (
    <div className="glass-panel p-6 rounded-xl hover:scale-[1.02] transition-all duration-200 animate-fade-in">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`p-4 rounded-xl bg-muted/50 ${typeInfo.color}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">{typeInfo.label}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {typeInfo.description}
          </p>
        </div>
        <Button onClick={onSetup} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Set up
        </Button>
      </div>
    </div>
  );
};
