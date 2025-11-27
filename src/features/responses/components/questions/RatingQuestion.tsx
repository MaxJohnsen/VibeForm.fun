import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';

interface RatingQuestionProps {
  label: string;
  settings: any;
  initialValue?: number;
  onSubmit: (value: number) => void;
  onValidationChange: (isValid: boolean) => void;
  formLanguage?: SupportedLanguage;
}

export const RatingQuestion = ({
  label,
  settings,
  initialValue,
  onSubmit,
  onValidationChange,
  formLanguage = 'en',
}: RatingQuestionProps) => {
  const [value, setValue] = useState<number | null>(initialValue ?? null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const min = settings?.min || 1;
  const max = settings?.max || 10;
  const scaleType = settings?.scaleType || 'numbers';
  const minLabel = settings?.minLabel;
  const maxLabel = settings?.maxLabel;
  const isRequired = settings?.required !== false;
  const t = useQuestionTranslation(formLanguage);

  const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // Prevent auto-focus on mobile after navigation
  useEffect(() => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.blur());
  }, []);

  useEffect(() => {
    const isValid = !isRequired || value !== null;
    onValidationChange(isValid);
    // Always notify parent of current value (including null for deselection)
    onSubmit(value);
  }, [value, isRequired, onValidationChange, onSubmit]);

  const handleSelect = (rating: number) => {
    // Toggle off if clicking the same rating
    if (value === rating) {
      setValue(null);
    } else {
      setValue(rating);
    }
    // Remove focus after selection on touch devices
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const emojis = ['😞', '😟', '😐', '🙂', '😊', '😄', '😁', '🤩', '😍', '🥰'];

  const renderRating = (rating: number) => {
    const isSelected = value === rating;
    const isHovered = hoveredValue === rating;
    const isInRange = hoveredValue !== null ? rating <= hoveredValue : rating <= (value || 0);

    if (scaleType === 'stars') {
      return (
        <button
          key={rating}
          onClick={() => handleSelect(rating)}
          onMouseEnter={() => setHoveredValue(rating)}
          onMouseLeave={() => setHoveredValue(null)}
          className="p-1.5 sm:p-2 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Star
            className={`h-8 w-8 sm:h-10 sm:w-10 transition-all ${isSelected || isInRange
                ? 'fill-primary text-primary scale-110'
                : 'text-border hover:text-primary/50'
              }`}
          />
        </button>
      );
    }

    if (scaleType === 'emoji' && rating <= 10) {
      return (
        <button
          key={rating}
          onClick={() => handleSelect(rating)}
          className={`text-3xl sm:text-4xl p-2 sm:p-4 transition-all min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isSelected ? 'scale-125' : 'opacity-60 hover:opacity-100 hover:scale-110'
            }`}
        >
          {emojis[rating - 1]}
        </button>
      );
    }

    return (
      <button
        key={rating}
        onClick={() => handleSelect(rating)}
        onMouseEnter={() => setHoveredValue(rating)}
        onMouseLeave={() => setHoveredValue(null)}
        className={`w-11 h-11 sm:w-14 sm:h-14 min-w-[44px] min-h-[44px] rounded-lg border-2 transition-all text-base sm:text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isSelected
            ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-110'
            : isHovered
              ? 'border-primary/50 bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
      >
        {rating}
      </button>
    );
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in">
      <QuestionLabel 
        label={label} 
        isRequired={isRequired} 
        optionalText={t.optional} 
        centered 
      />

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
          {ratings.map(renderRating)}
        </div>

        {(minLabel || maxLabel) && (
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-2">
            <span>{minLabel || min}</span>
            <span>{maxLabel || max}</span>
          </div>
        )}
      </div>
    </div>
  );
};
