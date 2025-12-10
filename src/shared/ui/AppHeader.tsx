import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  onBack?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved';
  actions?: ReactNode;
  centerContent?: ReactNode;
  className?: string;
}

export const AppHeader = ({
  title,
  subtitle,
  backTo,
  onBack,
  saveStatus,
  actions,
  centerContent,
  className,
}: AppHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    }
  };

  const showBackButton = backTo || onBack;

  return (
    <header className={cn(
      "h-14 md:h-16 border-b border-border/50 glass-panel flex-shrink-0",
      className
    )}>
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left Section: Back + Title */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -ml-2 md:ml-0 h-9 w-9 rounded-xl"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="truncate">{title}</h4>
            {(subtitle || saveStatus) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                {saveStatus && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      saveStatus === 'saving' && "bg-muted-foreground animate-pulse",
                      saveStatus === 'saved' && "bg-green-500",
                      saveStatus === 'idle' && "bg-green-500"
                    )} />
                    <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved'}</span>
                    {subtitle && <span>•</span>}
                  </div>
                )}
                {subtitle && <span className="truncate">{subtitle}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Center Content (e.g., status badge) */}
        {centerContent && (
          <div className="hidden sm:flex items-center justify-center">
            {centerContent}
          </div>
        )}

        {/* Right Section: Actions */}
        {actions && (
          <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};
