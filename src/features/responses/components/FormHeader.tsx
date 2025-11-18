import { X, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  onClose: () => void;
}

export const FormHeader = ({ currentQuestion, totalQuestions, onClose }: FormHeaderProps) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <Waves className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-foreground">VibeForm</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion} of {totalQuestions}
          </span>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
