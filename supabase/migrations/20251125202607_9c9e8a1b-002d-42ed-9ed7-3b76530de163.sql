-- Add intro and end settings columns to forms table
ALTER TABLE forms 
  ADD COLUMN intro_settings JSONB DEFAULT '{}',
  ADD COLUMN end_settings JSONB DEFAULT '{}';