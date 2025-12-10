import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[560px]',
  lg: 'sm:max-w-[720px]',
  xl: 'sm:max-w-[900px]',
  full: 'sm:max-w-full',
} as const;

export interface SlidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: keyof typeof sizeClasses;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export const SlidePanel = ({
  open,
  onOpenChange,
  title,
  description,
  size = 'lg',
  children,
  footer,
  className,
  icon,
}: SlidePanelProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'w-full p-0 flex flex-col gap-0 overflow-hidden',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate font-heading">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-sm text-muted-foreground truncate">
                  {description}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-border bg-card">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};