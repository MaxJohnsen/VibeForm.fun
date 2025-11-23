import { supabase } from '@/integrations/supabase/client';
import { QuestionType } from '@/shared/constants/questionTypes';

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  label: string;
  position: number;
  settings: Record<string, any>;
  logic?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionData {
  type: QuestionType;
  label: string;
  position: number;
  settings?: Record<string, any>;
}

export interface UpdateQuestionData {
  label?: string;
  settings?: Record<string, any>;
  position?: number;
  logic?: Record<string, any>;
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
        settings: questionData.settings || {},
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
    // First, get the question to know its position and form_id
    const { data: questionToDelete, error: fetchError } = await supabase
      .from('questions')
      .select('position, form_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!questionToDelete) throw new Error('Question not found');

    // Delete the question
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Update positions of all questions that came after it
    const { data: questionsToUpdate, error: fetchUpdateError } = await supabase
      .from('questions')
      .select('id, position')
      .eq('form_id', questionToDelete.form_id)
      .gt('position', questionToDelete.position);

    if (fetchUpdateError) throw fetchUpdateError;

    // Decrement positions for all questions after the deleted one
    if (questionsToUpdate && questionsToUpdate.length > 0) {
      const updates = questionsToUpdate.map(q => ({
        id: q.id,
        position: q.position - 1
      }));
      
      await this.reorderQuestions(updates);
    }
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
