-- Remove is_current column and add unique constraint for one answer per question per response
ALTER TABLE public.answers DROP COLUMN IF EXISTS is_current;

-- Add unique constraint to prevent duplicate answers for same question in same response
ALTER TABLE public.answers ADD CONSTRAINT answers_response_question_unique UNIQUE (response_id, question_id);