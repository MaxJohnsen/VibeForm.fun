import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BaseInputProps = {
  error?: string;
  variant?: 'text' | 'textarea';
};

type TextInputProps = BaseInputProps & {
  variant?: 'text';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

type TextareaInputProps = BaseInputProps & {
  variant: 'textarea';
  rows?: number;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export type RespondentInputProps = TextInputProps | TextareaInputProps;

const baseStyles = cn(
  'w-full px-4 py-3 sm:px-6 sm:py-4',
  'text-base sm:text-lg',
  'bg-white/50 dark:bg-white/5',
  'border rounded-xl',
  'focus:outline-none focus:ring-2 focus:ring-primary/20',
  'transition-all'
);

const getStateStyles = (error?: string) =>
  error
    ? 'border-destructive focus:border-destructive'
    : 'border-border/50 focus:border-primary';

export const RespondentInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  RespondentInputProps
>((props, ref) => {
  const { error, variant = 'text', ...rest } = props;
  const stateStyles = getStateStyles(error);

  if (variant === 'textarea') {
    const { rows = 6, ...textareaProps } = rest as TextareaInputProps;
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        rows={rows}
        className={cn(baseStyles, stateStyles, 'resize-none')}
        {...textareaProps}
      />
    );
  }

  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      className={cn(baseStyles, stateStyles)}
      {...(rest as TextInputProps)}
    />
  );
});

RespondentInput.displayName = 'RespondentInput';
