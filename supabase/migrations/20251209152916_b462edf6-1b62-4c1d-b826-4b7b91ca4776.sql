-- Drop and recreate RLS policies for questions
DROP POLICY IF EXISTS "Users can view questions for their forms" ON public.questions;
DROP POLICY IF EXISTS "Users can create questions for their forms" ON public.questions;
DROP POLICY IF EXISTS "Users can update questions for their forms" ON public.questions;
DROP POLICY IF EXISTS "Users can delete questions for their forms" ON public.questions;

CREATE POLICY "Workspace members can view questions" ON public.questions FOR SELECT
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

CREATE POLICY "Workspace members can create questions" ON public.questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

CREATE POLICY "Workspace members can update questions" ON public.questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

CREATE POLICY "Workspace members can delete questions" ON public.questions FOR DELETE
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

-- Drop and recreate RLS policies for answers
DROP POLICY IF EXISTS "Users can view answers for responses they can access" ON public.answers;

CREATE POLICY "Workspace members can view answers" ON public.answers FOR SELECT
USING (EXISTS (SELECT 1 FROM responses JOIN forms ON forms.id = responses.form_id WHERE responses.id = answers.response_id AND is_workspace_member(forms.workspace_id, auth.uid())));

-- Drop and recreate RLS policies for responses
DROP POLICY IF EXISTS "Form owners can view their form responses" ON public.responses;

CREATE POLICY "Workspace members can view responses" ON public.responses FOR SELECT
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = responses.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

-- Drop and recreate RLS policies for form_integrations
DROP POLICY IF EXISTS "Users can view integrations for their forms" ON public.form_integrations;
DROP POLICY IF EXISTS "Users can create integrations for their forms" ON public.form_integrations;
DROP POLICY IF EXISTS "Users can update integrations for their forms" ON public.form_integrations;
DROP POLICY IF EXISTS "Users can delete integrations for their forms" ON public.form_integrations;

CREATE POLICY "Workspace members can view integrations" ON public.form_integrations FOR SELECT
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = form_integrations.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

CREATE POLICY "Workspace members can create integrations" ON public.form_integrations FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM forms WHERE forms.id = form_integrations.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

CREATE POLICY "Workspace members can update integrations" ON public.form_integrations FOR UPDATE
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = form_integrations.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

CREATE POLICY "Workspace members can delete integrations" ON public.form_integrations FOR DELETE
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = form_integrations.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

-- Drop and recreate RLS policies for integration_logs
DROP POLICY IF EXISTS "Users can view logs for their form integrations" ON public.integration_logs;

CREATE POLICY "Workspace members can view integration logs" ON public.integration_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM form_integrations JOIN forms ON forms.id = form_integrations.form_id WHERE form_integrations.id = integration_logs.integration_id AND is_workspace_member(forms.workspace_id, auth.uid())));

-- Fix lottery_draws policies
DROP POLICY IF EXISTS "Workspace members can view lottery draws" ON public.lottery_draws;
DROP POLICY IF EXISTS "Workspace members can create lottery draws" ON public.lottery_draws;
DROP POLICY IF EXISTS "Workspace members can delete lottery draws" ON public.lottery_draws;

CREATE POLICY "Workspace members can view lottery draws" ON public.lottery_draws FOR SELECT
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = lottery_draws.form_id AND is_workspace_member(forms.workspace_id, auth.uid())));

CREATE POLICY "Workspace members can create lottery draws" ON public.lottery_draws FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM forms WHERE forms.id = lottery_draws.form_id AND is_workspace_member(forms.workspace_id, auth.uid())) AND created_by = auth.uid());

CREATE POLICY "Workspace members can delete lottery draws" ON public.lottery_draws FOR DELETE
USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = lottery_draws.form_id AND (forms.created_by = auth.uid() OR is_workspace_admin(forms.workspace_id, auth.uid()))));