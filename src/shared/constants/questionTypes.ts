import { 
  Type, 
  FileText, 
  ListOrdered, 
  ToggleLeft, 
  Star, 
  Mail, 
  Phone, 
  Calendar,
  User,
  LucideIcon 
} from 'lucide-react';

export type QuestionType = 
  | 'respondent_name'
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
    type: 'respondent_name',
    label: 'Respondent Name',
    description: 'Collect respondent\'s name',
    icon: User,
    colorClass: 'bg-[hsl(var(--charcoal))]/10 text-[hsl(var(--charcoal))]',
  },
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
    colorClass: 'bg-[hsl(var(--peach))]/25 text-[hsl(var(--peach-foreground))]',
  },
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    description: 'Radio or checkbox options',
    icon: ListOrdered,
    colorClass: 'bg-[hsl(var(--lavender))] text-[hsl(var(--lavender-foreground))]',
  },
  {
    type: 'yes_no',
    label: 'Yes/No',
    description: 'Binary choice question',
    icon: ToggleLeft,
    colorClass: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    type: 'rating',
    label: 'Rating',
    description: 'Scale from 1-10',
    icon: Star,
    colorClass: 'bg-yellow-500/10 text-yellow-600',
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address input',
    icon: Mail,
    colorClass: 'bg-primary/15 text-primary',
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Phone number input',
    icon: Phone,
    colorClass: 'bg-[hsl(300,10%,88%)] text-[hsl(300,10%,35%)]',
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: Calendar,
    colorClass: 'bg-[hsl(var(--lavender))] text-[hsl(var(--charcoal))]',
  },
];
