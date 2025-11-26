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

    // Allow null values for optional questions
    if (!sessionToken || !questionId) {
      return new Response(
        JSON.stringify({ error: 'sessionToken and questionId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // OPTIMIZATION: Parallelize initial queries - response + current question
    const [responseResult, questionResult] = await Promise.all([
      supabase.from('responses').select('*').eq('session_token', sessionToken).single(),
      supabase.from('questions').select('*').eq('id', questionId).single()
    ]);

    if (responseResult.error || !responseResult.data) {
      console.error('Response not found:', responseResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (questionResult.error || !questionResult.data) {
      console.error('Question not found:', questionResult.error);
      return new Response(
        JSON.stringify({ error: 'Question not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = responseResult.data;
    const currentQuestion = questionResult.data;

    // Save or update answer using UPSERT
    // Convert null OR empty/whitespace strings to a skipped marker to satisfy NOT NULL constraint
    const isEmptyOrWhitespace = typeof answerValue === 'string' && answerValue.trim() === '';
    const valueToStore = (answerValue === null || isEmptyOrWhitespace) 
      ? { _skipped: true } 
      : answerValue;
    
    console.log('Saving answer:', { questionId, answerValue, valueToStore });
    
    const { error: answerError } = await supabase
      .from('answers')
      .upsert({
        response_id: response.id,
        question_id: questionId,
        answer_value: valueToStore,
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

    // Evaluate logic to determine next question
    const logic = currentQuestion.logic as QuestionLogic | null;
    let nextQuestionId: string | null = null;
    let isComplete = false;

    // Evaluate logic if defined
    if (logic) {
      // Evaluate rules if they exist
      if (logic.rules && logic.rules.length > 0) {
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

    // OPTIMIZATION: Only fetch questions if we need sequential flow
    // (no logic determined next question yet)
    if (!isComplete && !nextQuestionId) {
      const { data: allQuestions, error: allQuestionsError } = await supabase
        .from('questions')
        .select('id, position')
        .eq('form_id', response.form_id)
        .order('position', { ascending: true });

      if (allQuestionsError) {
        console.error('Failed to fetch questions:', allQuestionsError);
        return new Response(
          JSON.stringify({ error: 'Failed to evaluate logic' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Find next question in sequence
      const currentIndex = allQuestions.findIndex(q => q.id === questionId);
      if (currentIndex >= 0 && currentIndex < allQuestions.length - 1) {
        nextQuestionId = allQuestions[currentIndex + 1].id;
      } else {
        isComplete = true;
      }
    }

    // OPTIMIZATION: Parallelize final operations
    const updateData: any = {
      current_question_id: nextQuestionId,
    };

    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    // Build parallel operations array - each query returns a promise when called
    const parallelOps: Promise<any>[] = [];
    
    // Always update response
    parallelOps.push(
      (async () => supabase.from('responses').update(updateData).eq('id', response.id))()
    );

    // Only fetch next question and answer if not complete
    if (!isComplete && nextQuestionId) {
      parallelOps.push(
        (async () => supabase.from('questions').select('*').eq('id', nextQuestionId).single())()
      );
      parallelOps.push(
        (async () => supabase.from('answers').select('answer_value').eq('response_id', response.id).eq('question_id', nextQuestionId).maybeSingle())()
      );
    }

    // Also get total question count
    parallelOps.push(
      (async () => supabase.from('questions').select('id', { count: 'exact', head: true }).eq('form_id', response.form_id))()
    );

    const results = await Promise.all(parallelOps);
    
    const updateResult = results[0];
    const nextQuestionResult = !isComplete && nextQuestionId ? results[1] : null;
    const existingAnswerResult = !isComplete && nextQuestionId ? results[2] : null;
    const countResult = results[results.length - 1];

    if (updateResult.error) {
      console.error('Failed to update response:', updateResult.error);
    }

    let nextQuestion = null;
    if (!isComplete && nextQuestionId && nextQuestionResult && !nextQuestionResult.error && nextQuestionResult.data) {
      // Convert skipped marker back to null
      const existingAnswer = existingAnswerResult?.data?.answer_value;
      const normalizedAnswer = existingAnswer?._skipped === true ? null : (existingAnswer || null);
      
      nextQuestion = {
        ...nextQuestionResult.data,
        currentAnswer: normalizedAnswer,
      };
    }

    const totalQuestions = countResult.count || 0;

    console.log('Answer submitted:', { questionId, nextQuestionId, isComplete });

    return new Response(
      JSON.stringify({
        success: true,
        isComplete,
        nextQuestion,
        totalQuestions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
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
