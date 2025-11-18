import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogicCondition {
  field: string;
  operator: string;
  value: any;
}

interface LogicAction {
  type: 'jump' | 'end';
  target_question_id?: string;
}

interface LogicRule {
  id: string;
  conditions: LogicCondition[];
  conditionOperator: 'AND' | 'OR';
  action: LogicAction;
}

interface QuestionLogic {
  rules: LogicRule[];
  default_action: 'next' | 'end';
  default_target?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken, questionId, answerValue } = await req.json();

    if (!sessionToken || !questionId || answerValue === undefined) {
      return new Response(
        JSON.stringify({ error: 'sessionToken, questionId, and answerValue are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get response record
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (responseError || !response) {
      console.error('Response not found:', responseError);
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current question
    const { data: currentQuestion, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError || !currentQuestion) {
      console.error('Question not found:', questionError);
      return new Response(
        JSON.stringify({ error: 'Question not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save or update answer using UPSERT
    const { error: answerError } = await supabase
      .from('answers')
      .upsert({
        response_id: response.id,
        question_id: questionId,
        answer_value: answerValue,
        answered_at: new Date().toISOString(),
      }, {
        onConflict: 'response_id,question_id'
      });

    if (answerError) {
      console.error('Failed to save answer:', answerError);
      return new Response(
        JSON.stringify({ error: 'Failed to save answer' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all questions for the form
    const { data: allQuestions, error: allQuestionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', response.form_id)
      .order('position', { ascending: true });

    if (allQuestionsError) {
      console.error('Failed to fetch questions:', allQuestionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to evaluate logic' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Evaluate logic to determine next question
    const logic = currentQuestion.logic as QuestionLogic | null;
    let nextQuestionId: string | null = null;
    let isComplete = false;

    if (logic && logic.rules && logic.rules.length > 0) {
      // Evaluate rules
      for (const rule of logic.rules) {
        if (evaluateRule(rule, answerValue)) {
          if (rule.action.type === 'end') {
            isComplete = true;
            break;
          } else if (rule.action.type === 'jump' && rule.action.target_question_id) {
            nextQuestionId = rule.action.target_question_id;
            break;
          }
        }
      }

      // If no rule matched, apply default action
      if (!isComplete && !nextQuestionId) {
        if (logic.default_action === 'end') {
          isComplete = true;
        } else if (logic.default_target) {
          nextQuestionId = logic.default_target;
        }
      }
    }

    // If no logic determined next question, go to next in sequence
    if (!isComplete && !nextQuestionId) {
      const currentIndex = allQuestions.findIndex(q => q.id === questionId);
      if (currentIndex >= 0 && currentIndex < allQuestions.length - 1) {
        nextQuestionId = allQuestions[currentIndex + 1].id;
      } else {
        isComplete = true;
      }
    }

    // Update response record
    const updateData: any = {
      current_question_id: nextQuestionId,
    };

    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('responses')
      .update(updateData)
      .eq('id', response.id);

    if (updateError) {
      console.error('Failed to update response:', updateError);
    }

    // Get next question if not complete
    let nextQuestion = null;
    if (!isComplete && nextQuestionId) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', nextQuestionId)
        .single();

      if (!error && data) {
        nextQuestion = data;
      }
    }

    console.log('Answer submitted:', { questionId, nextQuestionId, isComplete });

    return new Response(
      JSON.stringify({
        success: true,
        isComplete,
        nextQuestion,
        totalQuestions: allQuestions.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in submit-answer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function evaluateRule(rule: LogicRule, answerValue: any): boolean {
  const results = rule.conditions.map(condition => evaluateCondition(condition, answerValue));
  
  if (rule.conditionOperator === 'AND') {
    return results.every(r => r);
  } else {
    return results.some(r => r);
  }
}

function evaluateCondition(condition: LogicCondition, answerValue: any): boolean {
  const { operator, value } = condition;

  switch (operator) {
    case 'equals':
      return answerValue === value;
    case 'not_equals':
      return answerValue !== value;
    case 'contains':
      return String(answerValue).includes(String(value));
    case 'not_contains':
      return !String(answerValue).includes(String(value));
    case 'greater_than':
      return Number(answerValue) > Number(value);
    case 'less_than':
      return Number(answerValue) < Number(value);
    case 'greater_than_or_equal':
      return Number(answerValue) >= Number(value);
    case 'less_than_or_equal':
      return Number(answerValue) <= Number(value);
    case 'is_empty':
      return !answerValue || answerValue === '' || (Array.isArray(answerValue) && answerValue.length === 0);
    case 'is_not_empty':
      return !!answerValue && answerValue !== '' && (!Array.isArray(answerValue) || answerValue.length > 0);
    case 'before':
      return new Date(answerValue) < new Date(value);
    case 'after':
      return new Date(answerValue) > new Date(value);
    default:
      return false;
  }
}
