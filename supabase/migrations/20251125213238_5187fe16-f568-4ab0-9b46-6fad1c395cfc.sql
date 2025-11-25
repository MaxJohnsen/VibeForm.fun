-- Update the questions type check constraint to include respondent_name
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check 
  CHECK (type = ANY (ARRAY['respondent_name'::text, 'short_text'::text, 'long_text'::text, 'multiple_choice'::text, 'yes_no'::text, 'rating'::text, 'email'::text, 'phone'::text, 'date'::text]));