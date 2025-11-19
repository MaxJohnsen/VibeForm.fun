import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormNavigationProps {
  canGoBack: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const FormNavigation = ({
  canGoBack,
  isLastQuestion,
  isSubmitting,
  canProceed,
  onBack,
  onNext,
}: FormNavigationProps) => {
  const handleBackClick = () => {
    // Blur the button to remove hover/focus state
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onBack();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border/50 pb-safe">
      <div className="px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Back button - Icon only on mobile */}
        <div className="flex-shrink-0">
          {canGoBack && (
            <Button
              variant="ghost"
              onClick={handleBackClick}
              onTouchEnd={(e) => {
                // Force blur on touch devices
                e.currentTarget.blur();
              }}
              disabled={isSubmitting}
              className="gap-2 text-muted-foreground hover:text-foreground active:text-foreground h-11 sm:h-10 min-w-[44px] transition-colors touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          )}
        </div>

        {/* Keyboard hint - Hidden on mobile */}
        <div className="hidden md:flex flex-1 justify-center">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            Press <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border">Enter</kbd> to continue
          </span>
        </div>

        {/* Next/Submit button - Touch optimized */}
        <div className="flex-shrink-0">
          <Button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            size="lg"
            className="px-6 sm:px-8 h-11 min-w-[100px] sm:min-w-[120px] disabled:opacity-40 touch-manipulation"
          >
            {isLastQuestion ? 'Submit' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
