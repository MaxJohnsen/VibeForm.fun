-- Optimize the "get last answer" query used in navigate-back
CREATE INDEX IF NOT EXISTS idx_answers_response_answered ON public.answers(response_id, answered_at DESC);

-- Optimize answer lookups by response and question
CREATE INDEX IF NOT EXISTS idx_answers_response_question ON public.answers(response_id, question_id);

-- Optimize question lookups by form and position (for getting first question)
CREATE INDEX IF NOT EXISTS idx_questions_form_position ON public.questions(form_id, position);

-- Optimize response lookups by session token
CREATE INDEX IF NOT EXISTS idx_responses_session_token ON public.responses(session_token);