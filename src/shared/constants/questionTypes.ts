import { Type, AlignLeft, LucideIcon } from 'lucide-react';

export type QuestionType = 'short_text' | 'long_text';

export interface QuestionTypeDefinition {
  type: QuestionType;
  label: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
}

export const QUESTION_TYPES: QuestionTypeDefinition[] = [
  {
    type: 'short_text',
    label: 'Short Text',
    description: 'Single line input',
    icon: Type,
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    type: 'long_text',
    label: 'Long Text',
    description: 'Multi-line textarea',
    icon: AlignLeft,
    colorClass: 'bg-secondary/10 text-secondary',
  },
];
