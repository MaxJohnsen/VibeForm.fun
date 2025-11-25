-- Add language column to forms table
ALTER TABLE forms 
ADD COLUMN language text NOT NULL DEFAULT 'en';

-- Add check constraint to ensure only valid language codes
ALTER TABLE forms
ADD CONSTRAINT forms_language_check 
CHECK (language IN ('en', 'es', 'fr', 'de', 'pt', 'nl', 'it', 'sv', 'no', 'da', 'fi', 'pl', 'ru', 'ja', 'zh', 'ar', 'tr', 'ko'));