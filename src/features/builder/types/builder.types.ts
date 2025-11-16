export type QuestionType = 'short_text' | 'long_text';

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  label: string;
  placeholder: string | null;
  is_required: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}
