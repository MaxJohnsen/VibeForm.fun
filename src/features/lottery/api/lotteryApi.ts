import { supabase } from '@/integrations/supabase/client';

export interface Winner {
  responseId: string;
  name?: string;
  sessionToken: string;
}

export interface LotteryDraw {
  id: string;
  formId: string;
  drawnAt: string;
  winners: Winner[];
  settings: {
    namedOnly: boolean;
    winnerCount: number;
  };
}

export interface DrawOptions {
  formId: string;
  winnerCount: number;
  namedOnly: boolean;
}

// Fisher-Yates shuffle algorithm for random selection
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const lotteryApi = {
  async drawWinners(options: DrawOptions): Promise<Winner[]> {
    const { formId, winnerCount, namedOnly } = options;

    // Fetch all completed responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('id, session_token, status, form_id')
      .eq('form_id', formId)
      .eq('status', 'completed');

    if (responsesError) throw responsesError;
    if (!responses || responses.length === 0) {
      throw new Error('No completed responses found');
    }

    // If namedOnly, filter to those with respondent_name answer
    let eligibleResponses = responses;
    
    if (namedOnly) {
      // Get all questions for this form
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, type')
        .eq('form_id', formId);

      if (questionsError) throw questionsError;

      // Find the respondent_name question
      const nameQuestion = questions?.find(q => q.type === 'respondent_name');
      
      if (!nameQuestion) {
        throw new Error('No name question found in this form');
      }

      // Get all answers for the name question
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('response_id, answer_value')
        .eq('question_id', nameQuestion.id)
        .in('response_id', responses.map(r => r.id));

      if (answersError) throw answersError;

      // Filter to responses with name answers
      const responseIdsWithNames = new Set(
        answers?.filter(a => a.answer_value).map(a => a.response_id) || []
      );

      eligibleResponses = responses.filter(r => responseIdsWithNames.has(r.id));
    }

    if (eligibleResponses.length === 0) {
      throw new Error('No eligible responses found');
    }

    if (eligibleResponses.length < winnerCount) {
      throw new Error(`Only ${eligibleResponses.length} eligible responses, cannot draw ${winnerCount} winners`);
    }

    // Randomly select winners
    const shuffled = shuffleArray(eligibleResponses);
    const selectedResponses = shuffled.slice(0, winnerCount);

    // Get names for selected responses if they exist
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, type')
      .eq('form_id', formId);

    if (questionsError) throw questionsError;

    const nameQuestion = questions?.find(q => q.type === 'respondent_name');
    let nameAnswers: any[] = [];

    if (nameQuestion) {
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('response_id, answer_value')
        .eq('question_id', nameQuestion.id)
        .in('response_id', selectedResponses.map(r => r.id));

      if (!answersError && answers) {
        nameAnswers = answers;
      }
    }

    // Build winners array
    const winners: Winner[] = selectedResponses.map(response => {
      const nameAnswer = nameAnswers.find(a => a.response_id === response.id);
      return {
        responseId: response.id,
        sessionToken: response.session_token,
        name: nameAnswer?.answer_value || undefined,
      };
    });

    // Store the draw
    const { error: insertError } = await supabase
      .from('lottery_draws')
      .insert({
        form_id: formId,
        winners: winners as any,
        settings: { namedOnly, winnerCount } as any,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

    if (insertError) throw insertError;

    return winners;
  },

  async getDrawHistory(formId: string): Promise<LotteryDraw[]> {
    const { data, error } = await supabase
      .from('lottery_draws')
      .select('*')
      .eq('form_id', formId)
      .order('drawn_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(draw => ({
      id: draw.id,
      formId: draw.form_id,
      drawnAt: draw.drawn_at,
      winners: (draw.winners as any) as Winner[],
      settings: (draw.settings as any) as { namedOnly: boolean; winnerCount: number },
    }));
  },

  async deleteDraw(drawId: string): Promise<void> {
    const { error } = await supabase
      .from('lottery_draws')
      .delete()
      .eq('id', drawId);

    if (error) throw error;
  },

  async checkHasNameQuestion(formId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .eq('form_id', formId)
      .eq('type', 'respondent_name')
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  },

  async getEligibleCount(formId: string, namedOnly: boolean): Promise<number> {
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('id')
      .eq('form_id', formId)
      .eq('status', 'completed');

    if (responsesError) throw responsesError;
    if (!responses) return 0;

    if (!namedOnly) {
      return responses.length;
    }

    // Get name question
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('form_id', formId)
      .eq('type', 'respondent_name');

    if (questionsError) throw questionsError;
    if (!questions || questions.length === 0) return 0;

    const nameQuestionId = questions[0].id;

    // Count responses with name answers
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('response_id')
      .eq('question_id', nameQuestionId)
      .in('response_id', responses.map(r => r.id));

    if (answersError) throw answersError;
    
    return answers?.length || 0;
  },
};
