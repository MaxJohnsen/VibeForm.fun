import { IntegrationType } from '../api/integrationsApi';
import { getAllIntegrations } from '../integrations';
import { SidebarPalette, PaletteItem } from '@/shared/ui';
import { cn } from '@/lib/utils';

interface IntegrationTypePaletteProps {
  onSelectType: (type: IntegrationType) => void;
  className?: string;
}

export const IntegrationTypePalette = ({ onSelectType, className }: IntegrationTypePaletteProps) => {
  // Convert integrations to palette items
  const paletteItems: PaletteItem[] = getAllIntegrations().map((integration) => ({
    id: integration.type,
    icon: integration.icon,
    label: integration.label,
    description: integration.description,
    colorClass: integration.color,
  }));

  return (
    <SidebarPalette
      title="Integrations"
      subtitle="Click to create a new action"
      items={paletteItems}
      onSelect={(id) => onSelectType(id as IntegrationType)}
      searchable
      searchPlaceholder="Search integrations..."
      className={cn("w-64", className)}
    />
  );
};
