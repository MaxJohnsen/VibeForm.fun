-- Create enum for integration types
CREATE TYPE integration_type AS ENUM ('email', 'slack', 'webhook', 'zapier');

-- Create enum for integration triggers
CREATE TYPE integration_trigger AS ENUM ('form_completed', 'form_started', 'question_answered');

-- Create form_integrations table
CREATE TABLE public.form_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type integration_type NOT NULL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  trigger integration_trigger NOT NULL DEFAULT 'form_completed',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integration_logs table
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.form_integrations(id) ON DELETE CASCADE,
  response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  payload JSONB,
  response_data JSONB,
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_integrations
CREATE POLICY "Users can view integrations for their forms"
  ON public.form_integrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = form_integrations.form_id
        AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create integrations for their forms"
  ON public.form_integrations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = form_integrations.form_id
        AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update integrations for their forms"
  ON public.form_integrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = form_integrations.form_id
        AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete integrations for their forms"
  ON public.form_integrations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = form_integrations.form_id
        AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for integration_logs
CREATE POLICY "Users can view logs for their form integrations"
  ON public.integration_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.form_integrations
      JOIN public.forms ON forms.id = form_integrations.form_id
      WHERE form_integrations.id = integration_logs.integration_id
        AND forms.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_form_integrations_form_id ON public.form_integrations(form_id);
CREATE INDEX idx_form_integrations_enabled ON public.form_integrations(enabled);
CREATE INDEX idx_integration_logs_integration_id ON public.integration_logs(integration_id);
CREATE INDEX idx_integration_logs_response_id ON public.integration_logs(response_id);

-- Create trigger for updated_at
CREATE TRIGGER update_form_integrations_updated_at
  BEFORE UPDATE ON public.form_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();