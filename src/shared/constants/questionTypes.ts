import { 
  Type, 
  FileText, 
  ListOrdered, 
  ToggleLeft, 
  Star, 
  Mail, 
  Phone, 
  Calendar,
  LucideIcon 
} from 'lucide-react';

export type QuestionType = 
  | 'short_text' 
  | 'long_text'
  | 'multiple_choice'
  | 'yes_no'
  | 'rating'
  | 'email'
  | 'phone'
  | 'date';

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
    icon: FileText,
    colorClass: 'bg-secondary/10 text-secondary',
  },
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    description: 'Radio or checkbox options',
    icon: ListOrdered,
    colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    type: 'yes_no',
    label: 'Yes/No',
    description: 'Binary choice question',
    icon: ToggleLeft,
    colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    type: 'rating',
    label: 'Rating',
    description: 'Scale from 1-10',
    icon: Star,
    colorClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address input',
    icon: Mail,
    colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Phone number input',
    icon: Phone,
    colorClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: Calendar,
    colorClass: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
];
