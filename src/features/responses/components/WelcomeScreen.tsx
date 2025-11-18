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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 text-center animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            {formTitle}
          </h1>
          {formDescription && (
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
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
          className="px-12 py-6 text-lg gap-2 hover-elevate"
        >
          Start
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
