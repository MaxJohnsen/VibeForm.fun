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
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border/50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex-1">
          {canGoBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={isSubmitting}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            Press <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border">Enter</kbd> to continue
          </span>
        </div>

        <div className="flex-1 flex justify-end">
          <Button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            size="lg"
            className="px-8"
          >
            {isLastQuestion ? 'Submit' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
