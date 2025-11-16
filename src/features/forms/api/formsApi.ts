import { supabase } from '@/integrations/supabase/client';

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateFormData {
  title: string;
  description?: string;
}

export interface UpdateFormData {
  title?: string;
  description?: string;
  status?: 'draft' | 'active' | 'archived';
}

export const formsApi = {
  async fetchForms(): Promise<Form[]> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Form[];
  },

  async getFormById(id: string): Promise<Form> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Form;
  },

  async createForm(formData: CreateFormData): Promise<Form> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Form;
  },

  async updateForm(id: string, formData: UpdateFormData): Promise<Form> {
    const { data, error } = await supabase
      .from('forms')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Form;
  },

  async deleteForm(id: string): Promise<void> {
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
