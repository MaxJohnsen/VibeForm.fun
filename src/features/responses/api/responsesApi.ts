import { supabase } from '@/integrations/supabase/client';

export interface StartResponseData {
  sessionToken: string;
  responseId: string;
  form: {
    title: string;
    intro_settings?: Record<string, any>;
    end_settings?: Record<string, any>;
  };
  question: any;
  totalQuestions: number;
  isComplete?: boolean;
}

export interface SubmitAnswerData {
  success: boolean;
  isComplete: boolean;
  nextQuestion: any | null;
  totalQuestions: number;
}

export interface NavigateBackData {
  success: boolean;
  question: any;
  totalQuestions: number;
}

export const responsesApi = {
  async startResponse(formId: string): Promise<StartResponseData> {
    const { data, error } = await supabase.functions.invoke('start-response', {
      body: { formId },
    });

    if (error) throw error;
    return data;
  },

  async resumeResponse(sessionToken: string): Promise<StartResponseData> {
    const { data, error } = await supabase.functions.invoke('resume-response', {
      body: { sessionToken },
    });

    if (error) throw error;
    return data;
  },

  async submitAnswer(
    sessionToken: string,
    questionId: string,
    answerValue: any
  ): Promise<SubmitAnswerData> {
    const { data, error } = await supabase.functions.invoke('submit-answer', {
      body: { sessionToken, questionId, answerValue },
    });

    if (error) throw error;
    return data;
  },

  async navigateBack(sessionToken: string, currentQuestionId: string): Promise<NavigateBackData> {
    const { data, error } = await supabase.functions.invoke('navigate-back', {
      body: { sessionToken, currentQuestionId },
    });

    if (error) throw error;
    return data;
  },
};
