-- Create lottery_draws table to store draw history
CREATE TABLE public.lottery_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  drawn_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  winners JSONB NOT NULL,
  settings JSONB DEFAULT '{"namedOnly": false, "winnerCount": 1}'::jsonb,
  user_id UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;

-- RLS policies for lottery_draws
CREATE POLICY "Users can view their own lottery draws"
  ON public.lottery_draws
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = lottery_draws.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lottery draws for their forms"
  ON public.lottery_draws
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = lottery_draws.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own lottery draws"
  ON public.lottery_draws
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = lottery_draws.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Create index for better query performance
CREATE INDEX idx_lottery_draws_form_id ON public.lottery_draws(form_id);
CREATE INDEX idx_lottery_draws_user_id ON public.lottery_draws(user_id);