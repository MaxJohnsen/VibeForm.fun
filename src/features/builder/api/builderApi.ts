import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionType } from '../types/builder.types';

export const builderApi = {
  async fetchQuestions(formId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []) as Question[];
  },

  async createQuestion(formId: string, type: QuestionType): Promise<Question> {
    // Get the max order_index for this form
    const { data: existingQuestions } = await supabase
      .from('questions')
      .select('order_index')
      .eq('form_id', formId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingQuestions?.[0]?.order_index !== undefined 
      ? existingQuestions[0].order_index + 1 
      : 0;

    const { data, error } = await supabase
      .from('questions')
      .insert({
        form_id: formId,
        type,
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Question;
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
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

  async reorderQuestions(formId: string, questionIds: string[]): Promise<void> {
    const updates = questionIds.map((id, index) => ({
      id,
      form_id: formId,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from('questions')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }
  },
};
