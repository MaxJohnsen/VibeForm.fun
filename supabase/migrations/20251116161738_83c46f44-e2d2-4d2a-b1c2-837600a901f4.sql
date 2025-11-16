-- Drop the old check constraint
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;

-- Add updated check constraint with all question types
ALTER TABLE questions ADD CONSTRAINT questions_type_check 
  CHECK (type IN (
    'short_text',
    'long_text',
    'multiple_choice',
    'yes_no',
    'rating',
    'email',
    'phone',
    'date'
  ));