import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletionScreenProps {
  formTitle: string;
}

export const CompletionScreen = ({ formTitle }: CompletionScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
      <div className="rounded-full bg-primary/10 p-6">
        <CheckCircle2 className="h-16 w-16 text-primary" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Thank you!</h1>
        <p className="text-lg text-muted-foreground">
          Your response to "{formTitle}" has been submitted successfully.
        </p>
      </div>

      <Button
        onClick={() => window.location.href = '/'}
        variant="outline"
        size="lg"
      >
        Close
      </Button>
    </div>
  );
};
