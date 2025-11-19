import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  formTitle: string;
  formDescription?: string;
  totalQuestions: number;
  onStart: () => void;
}

export const WelcomeScreen = ({
  formTitle,
  formDescription,
  totalQuestions,
  onStart,
}: WelcomeScreenProps) => {
  return (
    <div className="h-full flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8 text-center animate-fade-in">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {formTitle}
          </h1>
          {formDescription && (
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto px-4">
              {formDescription}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Takes about {Math.ceil(totalQuestions * 0.5)} minutes</span>
          <span>•</span>
          <span>{totalQuestions} questions</span>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg gap-2 hover-elevate min-h-[48px] touch-manipulation"
        >
          Start
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
};
