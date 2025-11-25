-- Update slug format validation to allow hyphens at start and end
ALTER TABLE forms 
DROP CONSTRAINT IF EXISTS valid_slug_format;

ALTER TABLE forms 
ADD CONSTRAINT valid_slug_format 
CHECK (slug IS NULL OR slug ~ '^[a-z0-9-]+$');