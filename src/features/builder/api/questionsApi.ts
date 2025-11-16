import { supabase } from '@/integrations/supabase/client';
import { QuestionType } from '@/shared/constants/questionTypes';

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  label: string;
  position: number;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionData {
  type: QuestionType;
  label: string;
  position: number;
}

export interface UpdateQuestionData {
  label?: string;
  settings?: Record<string, any>;
  position?: number;
}

export const questionsApi = {
  async fetchQuestions(formId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('position', { ascending: true });

    if (error) throw error;
    return (data || []) as Question[];
  },

  async createQuestion(formId: string, questionData: CreateQuestionData): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        form_id: formId,
        type: questionData.type,
        label: questionData.label,
        position: questionData.position,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Question;
  },

  async updateQuestion(id: string, questionData: UpdateQuestionData): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update(questionData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Question;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderQuestions(updates: { id: string; position: number }[]): Promise<void> {
    const promises = updates.map(({ id, position }) =>
      supabase
        .from('questions')
        .update({ position })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    const error = results.find(r => r.error)?.error;
    if (error) throw error;
  },
};
