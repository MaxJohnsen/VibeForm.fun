-- Add RLS policy for responses table
CREATE POLICY "Form owners can view their form responses"
ON responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = responses.form_id
    AND forms.user_id = auth.uid()
  )
);

-- Add RLS policy for answers table
CREATE POLICY "Users can view answers for responses they can access"
ON answers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM responses
    JOIN forms ON forms.id = answers.response_id
    WHERE responses.form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  )
);