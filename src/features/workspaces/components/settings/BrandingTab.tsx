import { Palette } from 'lucide-react';
import { SettingsCard } from '@/shared/ui/SettingsCard';

export const BrandingTab = () => {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Workspace Branding"
        description="Customize the look and feel of your workspace"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Palette className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Customize your workspace with logos, colors, and custom themes. 
            This feature is currently under development.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
};
