import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletionScreenProps {
  formTitle: string;
  onRestart: () => void;
}

export const CompletionScreen = ({ formTitle, onRestart }: CompletionScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 py-12 sm:py-16 px-4 animate-fade-in">
      <div className="rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 p-6 sm:p-8 shadow-lg shadow-primary/20">
        <CheckCircle2 className="h-14 w-14 sm:h-20 sm:w-20 text-primary" />
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Thank you!
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
          Your response to "{formTitle}" has been submitted successfully.
        </p>
      </div>

      <Button
        onClick={onRestart}
        size="lg"
        className="min-h-[44px] shadow-lg hover:shadow-xl transition-shadow"
      >
        Start Over
      </Button>
    </div>
  );
};
