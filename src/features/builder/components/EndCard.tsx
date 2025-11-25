import { Flag, ExternalLink, RotateCcw } from 'lucide-react';
import { EndSettings } from '../types/screenSettings';

interface EndCardProps {
  settings: EndSettings;
  isSelected: boolean;
  onSelect: () => void;
}

export const EndCard = ({ settings, isSelected, onSelect }: EndCardProps) => {
  const displayTitle = settings.title || 'Thank you!';
  const hasMessage = settings.message && settings.message.trim().length > 0;

  const getActionIcon = () => {
    switch (settings.buttonAction) {
      case 'redirect':
        return <ExternalLink className="h-3 w-3" />;
      case 'restart':
        return <RotateCcw className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  // Strip HTML tags for preview (in case message becomes rich text in future)
  const getTextContent = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <div
      onClick={onSelect}
      className={`glass-panel p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20'
          : 'border-primary/30 hover:border-primary/50 hover-elevate'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3 flex items-center justify-center">
          <Flag className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">
              End Screen
            </span>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2">
              {displayTitle}
            </h3>
            {hasMessage && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {typeof settings.message === 'string' ? getTextContent(settings.message) : settings.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {getActionIcon()}
              Button action: {settings.buttonAction || 'close'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
