import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  header: ReactNode;
  leftSidebar?: ReactNode;
  leftSidebarWidth?: string;
  rightSidebar?: ReactNode;
  rightSidebarWidth?: string;
  sidebarTitle?: string;
  mobileSheetOpen?: boolean;
  onMobileSheetOpenChange?: (open: boolean) => void;
  mobileTrigger?: ReactNode;
  hideMobileTrigger?: boolean;
  children: ReactNode;
  className?: string;
}

export const AppShell = ({
  header,
  leftSidebar,
  leftSidebarWidth = 'w-64',
  rightSidebar,
  rightSidebarWidth = 'w-80',
  sidebarTitle = 'Menu',
  mobileSheetOpen,
  onMobileSheetOpenChange,
  mobileTrigger,
  hideMobileTrigger = false,
  children,
  className,
}: AppShellProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("h-[100dvh] flex flex-col bg-background bg-dots overflow-hidden", className)}>
      {header}
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar */}
        {!isMobile && leftSidebar && (
          <div className={cn("h-full shrink-0", leftSidebarWidth)}>
            {leftSidebar}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Desktop Right Sidebar */}
        {!isMobile && rightSidebar && (
          <div className={cn("h-full shrink-0", rightSidebarWidth)}>
            {rightSidebar}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Sheet */}
      {isMobile && leftSidebar && !hideMobileTrigger && (
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
              {leftSidebar}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
