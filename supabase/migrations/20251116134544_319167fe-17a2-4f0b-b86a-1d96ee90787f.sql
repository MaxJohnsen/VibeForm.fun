-- Create forms table
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Form',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text')),
  label TEXT NOT NULL DEFAULT 'Untitled Question',
  placeholder TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms
CREATE POLICY "Users can view their own forms"
ON public.forms FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms"
ON public.forms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms"
ON public.forms FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms"
ON public.forms FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for questions (via form ownership)
CREATE POLICY "Users can view questions for their forms"
ON public.questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = questions.form_id
    AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create questions for their forms"
ON public.questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = questions.form_id
    AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update questions for their forms"
ON public.questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = questions.form_id
    AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete questions for their forms"
ON public.questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = questions.form_id
    AND forms.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_forms_user_id_updated_at ON public.forms(user_id, updated_at DESC);
CREATE INDEX idx_questions_form_id_order ON public.questions(form_id, order_index);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_forms_updated_at
BEFORE UPDATE ON public.forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();