import { Play } from 'lucide-react';
import { IntroSettings } from '../types/screenSettings';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/shared/ui';

interface IntroCardProps {
  formTitle: string;
  settings: IntroSettings;
  isSelected: boolean;
  onSelect: () => void;
}

export const IntroCard = ({
  formTitle,
  settings,
  isSelected,
  onSelect,
}: IntroCardProps) => {
  const displayTitle = settings.title || formTitle;
  const hasDescription = settings.description && settings.description.trim().length > 0;
  
  const getTextContent = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <GlassCard
      onClick={onSelect}
      className={cn(
        'p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-200',
        isSelected
          ? '!border !border-primary shadow-xl shadow-primary/40 ring-4 ring-primary/10'
          : '!border !border-border/30 hover:!border-border/50 hover-elevate'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3 flex items-center justify-center">
          <Play className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">
              Intro Screen
            </span>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2">
              {displayTitle}
            </h3>
            {hasDescription && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {getTextContent(settings.description)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
            {settings.showEstimatedTime && (
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                Estimated time
              </span>
            )}
            {settings.showQuestionCount && (
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                Question count
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
