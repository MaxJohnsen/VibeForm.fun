import { Sparkles } from 'lucide-react';
import { IntroSettings } from '../types/screenSettings';

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

  return (
    <div
      onClick={onSelect}
      className={`glass-panel p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20'
          : 'border-primary/30 hover:border-primary/50 hover-elevate'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-2 sm:p-2.5">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
                {settings.description}
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
    </div>
  );
};
