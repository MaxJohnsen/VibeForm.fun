import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateQuestionProps {
  label: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const DateQuestion = ({
  label,
  settings,
  initialValue,
  onSubmit,
  onValidationChange,
}: DateQuestionProps) => {
  const [date, setDate] = useState<Date | undefined>(
    initialValue ? new Date(initialValue) : undefined
  );

  useEffect(() => {
    const isValid = !!date;
    onValidationChange(isValid);
    if (isValid) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onSubmit(formattedDate);
    }
  }, [date, onValidationChange, onSubmit]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Enter key handling is now managed by parent RespondentPage
  };

  return (
    <div className="space-y-8 animate-fade-in" onKeyPress={handleKeyPress}>
      <h2 className="text-4xl md:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full max-w-md justify-start text-left font-normal text-lg py-6 border-b border-t-0 border-x-0 rounded-none hover:border-primary"
          >
            <CalendarIcon className="mr-2 h-5 w-5" />
            {date ? format(date, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
