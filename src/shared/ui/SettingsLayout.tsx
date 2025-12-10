import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface SettingsTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  className?: string;
}

export const SettingsLayout = ({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: SettingsLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 md:px-6 py-4 md:py-6 border-b border-border/50">
        <h1 className="heading-page">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {/* Mobile: Horizontal scrollable tabs */}
      {isMobile && (
        <ScrollArea className="w-full border-b border-border/50">
          <div className="flex px-4 py-2 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop: Sidebar navigation */}
        {!isMobile && (
          <aside className="w-56 shrink-0 border-r border-border/50 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
