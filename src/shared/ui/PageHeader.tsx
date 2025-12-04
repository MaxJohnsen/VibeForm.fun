import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  onBack?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved';
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  backTo,
  onBack,
  saveStatus,
  actions,
  className,
}: PageHeaderProps) => {
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
    <div className={cn(
      "sticky top-0 z-10 border-b border-border/50 backdrop-blur-xl bg-background/50",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
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
              <h1 className="text-base md:text-xl font-semibold truncate">
                {title}
              </h1>
              {(subtitle || saveStatus) && (
                <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:flex items-center gap-1">
                  {subtitle}
                  {saveStatus === 'saving' && (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
