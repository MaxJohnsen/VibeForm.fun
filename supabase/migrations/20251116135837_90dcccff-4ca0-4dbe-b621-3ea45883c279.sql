-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table with enum-style type check
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text')),
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_questions_form_id ON questions(form_id);
CREATE INDEX idx_questions_position ON questions(form_id, position);

-- Enable RLS on forms
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms
CREATE POLICY "Users can view their own forms"
  ON forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms"
  ON forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms"
  ON forms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms"
  ON forms FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
CREATE POLICY "Users can view questions for their forms"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for their forms"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for their forms"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for their forms"
  ON questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();