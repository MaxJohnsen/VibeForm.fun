import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface QuestionRendererProps {
  question: any;
  onSubmit: (value: any) => void;
  isSubmitting: boolean;
}

export const QuestionRenderer = ({ question, onSubmit, isSubmitting }: QuestionRendererProps) => {
  const [value, setValue] = useState<any>('');
  const [date, setDate] = useState<Date>();

  const handleSubmit = () => {
    let submitValue = value;

    if (question.type === 'date' && date) {
      submitValue = date.toISOString();
    } else if (question.type === 'rating') {
      submitValue = Number(value);
    }

    onSubmit(submitValue);
  };

  const renderInput = () => {
    const settings = question.settings || {};

    switch (question.type) {
      case 'short_text':
      case 'email':
      case 'phone':
        return (
          <div className="space-y-4">
            <Input
              type={question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={settings.placeholder || 'Your answer...'}
              required={settings.required}
              className="text-lg"
              disabled={isSubmitting}
            />
          </div>
        );

      case 'long_text':
        return (
          <div className="space-y-4">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={settings.placeholder || 'Your answer...'}
              required={settings.required}
              rows={6}
              className="text-lg resize-none"
              disabled={isSubmitting}
            />
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <RadioGroup value={value} onValueChange={setValue} disabled={isSubmitting}>
              {settings.choices?.map((choice: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={choice} id={`choice-${idx}`} />
                  <Label htmlFor={`choice-${idx}`} className="flex-1 cursor-pointer text-base">
                    {choice}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'yes_no':
        return (
          <div className="space-y-4">
            <RadioGroup value={value} onValueChange={setValue} disabled={isSubmitting}>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="flex-1 cursor-pointer text-base">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="flex-1 cursor-pointer text-base">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'rating':
        const maxRating = settings.maxRating || 10;
        return (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={value === String(num) ? 'default' : 'outline'}
                  onClick={() => setValue(String(num))}
                  disabled={isSubmitting}
                  className="w-12 h-12 text-lg"
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal text-lg',
                    !date && 'text-muted-foreground'
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  const isValid = () => {
    const settings = question.settings || {};
    
    if (question.type === 'date') {
      return date !== undefined;
    }
    
    if (settings.required) {
      return value && value !== '';
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{question.label}</h2>
        {question.settings?.description && (
          <p className="text-muted-foreground">{question.settings.description}</p>
        )}
      </div>

      {renderInput()}

      <Button
        onClick={handleSubmit}
        disabled={!isValid() || isSubmitting}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isSubmitting ? 'Submitting...' : 'Continue'}
      </Button>
    </div>
  );
};
