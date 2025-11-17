-- Create responses table for anonymous form submissions
CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  current_question_id uuid,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create answers table for storing individual question responses
CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_value jsonb NOT NULL,
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  is_current boolean NOT NULL DEFAULT true,
  UNIQUE (response_id, question_id, is_current)
);

-- Enable RLS on both tables
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- RLS policies: Only service role can access (for edge functions)
-- No policies for regular users = complete lockdown except via service role

-- Create indexes for performance
CREATE INDEX idx_responses_session_token ON public.responses(session_token);
CREATE INDEX idx_responses_form_id ON public.responses(form_id);
CREATE INDEX idx_answers_response_id ON public.answers(response_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_answers_is_current ON public.answers(is_current) WHERE is_current = true;