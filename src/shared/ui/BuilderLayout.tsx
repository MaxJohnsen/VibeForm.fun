import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface BuilderLayoutProps {
  header: ReactNode;
  sidebar: ReactNode;
  sidebarTitle?: string;
  sidebarWidth?: string;
  rightPanel?: ReactNode;
  rightPanelWidth?: string;
  children: ReactNode;
  className?: string;
  /** For controlling mobile sheet externally */
  mobileSheetOpen?: boolean;
  onMobileSheetOpenChange?: (open: boolean) => void;
  /** Custom mobile trigger - if not provided, a default Plus button is shown */
  mobileTrigger?: ReactNode;
  /** Hide the default mobile trigger */
  hideMobileTrigger?: boolean;
}

export const BuilderLayout = ({
  header,
  sidebar,
  sidebarTitle = 'Add Item',
  sidebarWidth = 'w-64',
  rightPanel,
  rightPanelWidth = 'w-80',
  children,
  className,
  mobileSheetOpen,
  onMobileSheetOpenChange,
  mobileTrigger,
  hideMobileTrigger = false,
}: BuilderLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("h-[100dvh] flex flex-col bg-background overflow-hidden", className)}>
      {header}
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className={cn("h-full shrink-0", sidebarWidth)}>
            {sidebar}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Desktop Right Panel */}
        {!isMobile && rightPanel && (
          <div className={cn("h-full shrink-0", rightPanelWidth)}>
            {rightPanel}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Sheet */}
      {isMobile && !hideMobileTrigger && (
        <Sheet open={mobileSheetOpen} onOpenChange={onMobileSheetOpenChange}>
          {mobileTrigger ? (
            <SheetTrigger asChild>
              {mobileTrigger}
            </SheetTrigger>
          ) : (
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          )}
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle>{sidebarTitle}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto h-full pb-6">
              {sidebar}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
