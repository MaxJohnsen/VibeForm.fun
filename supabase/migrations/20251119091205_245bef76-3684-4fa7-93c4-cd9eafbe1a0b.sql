-- Drop the incorrect policy
DROP POLICY IF EXISTS "Users can view answers for responses they can access" ON answers;

-- Create the correct policy with proper JOIN
CREATE POLICY "Users can view answers for responses they can access"
ON answers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM responses
    JOIN forms ON forms.id = responses.form_id
    WHERE responses.id = answers.response_id
    AND forms.user_id = auth.uid()
  )
);