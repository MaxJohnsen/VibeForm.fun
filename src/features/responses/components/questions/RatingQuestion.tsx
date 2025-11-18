import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface RatingQuestionProps {
  label: string;
  settings: any;
  initialValue?: number;
  onSubmit: (value: number) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const RatingQuestion = ({
  label,
  settings,
  initialValue,
  onSubmit,
  onValidationChange,
}: RatingQuestionProps) => {
  const [value, setValue] = useState<number | null>(initialValue ?? null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  
  const min = settings?.min || 1;
  const max = settings?.max || 10;
  const scaleType = settings?.scaleType || 'numbers';
  const minLabel = settings?.minLabel;
  const maxLabel = settings?.maxLabel;

  const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    const isValid = value !== null;
    onValidationChange(isValid);
    if (isValid) {
      onSubmit(value);
    }
  }, [value, onValidationChange, onSubmit]);

  const handleSelect = (rating: number) => {
    setValue(rating);
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
          className="p-2 transition-all"
        >
          <Star
            className={`h-10 w-10 transition-all ${
              isSelected || isInRange
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
          className={`text-4xl p-4 transition-all ${
            isSelected ? 'scale-125' : 'opacity-60 hover:opacity-100 hover:scale-110'
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
        className={`w-14 h-14 rounded-lg border-2 transition-all text-lg font-medium ${
          isSelected
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
    <div className="space-y-12 animate-fade-in">
      <h2 className="text-4xl md:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 justify-center items-center">
          {ratings.map(renderRating)}
        </div>

        {(minLabel || maxLabel) && (
          <div className="flex justify-between text-sm text-muted-foreground max-w-2xl mx-auto">
            <span>{minLabel || min}</span>
            <span>{maxLabel || max}</span>
          </div>
        )}
      </div>
    </div>
  );
};
