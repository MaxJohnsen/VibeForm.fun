-- Add slug column to forms table
ALTER TABLE forms 
ADD COLUMN slug TEXT UNIQUE;

-- Add index for efficient lookups
CREATE INDEX idx_forms_slug ON forms(slug);

-- Add check constraint for valid slug format (lowercase letters, numbers, hyphens only)
ALTER TABLE forms 
ADD CONSTRAINT valid_slug_format 
CHECK (slug IS NULL OR slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$');

-- Add check constraint for valid length (3-50 characters)
ALTER TABLE forms 
ADD CONSTRAINT valid_slug_length 
CHECK (slug IS NULL OR (char_length(slug) >= 3 AND char_length(slug) <= 50));