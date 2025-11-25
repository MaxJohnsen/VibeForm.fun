import { X } from 'lucide-react';
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
      <div className="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand - Simplified on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="relative">
            <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              VibeForm
            </span>
          </div>
        </div>

        {/* Progress - Centered and responsive */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center max-w-xs sm:max-w-sm">
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {currentQuestion}/{totalQuestions}
          </span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Close button - Touch optimized */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  );
};
