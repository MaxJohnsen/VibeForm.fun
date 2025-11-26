import { supabase } from '@/integrations/supabase/client';

export interface ResponseWithAnswers {
  id: string;
  session_token: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  current_question_id: string | null;
  answers: Array<{
    id: string;
    question_id: string;
    answer_value: any;
    answered_at: string;
  }>;
}

export interface QuestionWithAnswers {
  id: string;
  label: string;
  type: string;
  position: number;
  answers: Array<{
    answer_value: any;
  }>;
}

export const analyticsApi = {
  async fetchFormAnalytics(formId: string) {
    // Fetch all responses with their answers
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select(`
        id,
        session_token,
        status,
        started_at,
        completed_at,
        current_question_id,
        answers (
          id,
          question_id,
          answer_value,
          answered_at
        )
      `)
      .eq('form_id', formId)
      .order('started_at', { ascending: false });

    if (responsesError) throw responsesError;

    // Fetch all questions for this form
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, label, type, position, settings')
      .eq('form_id', formId)
      .order('position', { ascending: true });

    if (questionsError) throw questionsError;

    return {
      responses: responses as ResponseWithAnswers[],
      questions,
    };
  },

  async fetchQuestionAnswers(formId: string) {
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id,
        label,
        type,
        position,
        answers!inner (
          answer_value
        )
      `)
      .eq('form_id', formId)
      .order('position', { ascending: true });

    if (error) throw error;
    return questions as QuestionWithAnswers[];
  },

  async exportToCSV(formId: string): Promise<string> {
    const { responses, questions } = await this.fetchFormAnalytics(formId);
    
    // Build CSV header
    const headers = [
      'Session',
      'Status',
      'Started At',
      'Completed At',
      'Duration',
      ...questions.map(q => `Q${q.position}: ${q.label}`)
    ];
    
    // Build CSV rows
    const rows = responses.map(response => {
      const duration = response.completed_at
        ? Math.floor((new Date(response.completed_at).getTime() - new Date(response.started_at).getTime()) / 1000)
        : '';
      
      const answerMap = new Map(
        response.answers.map(a => [a.question_id, a.answer_value])
      );
      
      return [
        response.session_token.slice(0, 8),
        response.status,
        new Date(response.started_at).toLocaleString(),
        response.completed_at ? new Date(response.completed_at).toLocaleString() : '',
        duration ? `${duration}s` : '',
        ...questions.map(q => {
          const value = answerMap.get(q.id);
          if (value === null || value === undefined) return '';
          // Handle blank answers
          if (typeof value === 'object' && (value as any)._skipped === true) return '(blank)';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
      ];
    });
    
    // Combine into CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  },

  async exportQuestionToCSV(formId: string, questionId: string, questionLabel: string): Promise<string> {
    const { responses, questions } = await this.fetchFormAnalytics(formId);
    
    // Find the specific question
    const question = questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');
    
    // Build CSV header
    const headers = [
      'Session',
      'Status',
      'Answered At',
      `${questionLabel}`
    ];
    
    // Build CSV rows - only for responses that answered this question
    const rows = responses
      .filter(response => response.answers.some(a => a.question_id === questionId))
      .map(response => {
        const answer = response.answers.find(a => a.question_id === questionId);
        
        let answerValue = '';
        if (answer) {
          const value = answer.answer_value;
          if (value === null || value === undefined) {
            answerValue = '';
          } else if (typeof value === 'object' && (value as any)._skipped === true) {
            answerValue = '(blank)';
          } else if (typeof value === 'object') {
            answerValue = JSON.stringify(value);
          } else {
            answerValue = String(value);
          }
        }
        
        return [
          response.session_token.slice(0, 8),
          response.status,
          answer ? new Date(answer.answered_at).toLocaleString() : '',
          answerValue
        ];
      });
    
    // Combine into CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
};
