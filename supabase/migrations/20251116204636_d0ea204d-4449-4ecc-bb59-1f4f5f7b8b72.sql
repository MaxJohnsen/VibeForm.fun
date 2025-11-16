-- Add logic column to questions table for conditional logic/rules
ALTER TABLE questions 
ADD COLUMN logic JSONB DEFAULT '{"rules": [], "default_action": "next"}'::jsonb;

-- Create index for better performance when querying logic
CREATE INDEX idx_questions_logic ON questions USING GIN (logic);

-- Add comment for documentation
COMMENT ON COLUMN questions.logic IS 'Stores conditional logic rules for question flow control';
