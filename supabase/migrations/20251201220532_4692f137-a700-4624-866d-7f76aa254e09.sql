-- Add integrations_processed_at column to responses table for idempotency
ALTER TABLE responses 
ADD COLUMN integrations_processed_at timestamptz DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX idx_responses_integrations_processed 
ON responses(form_id, integrations_processed_at) 
WHERE integrations_processed_at IS NOT NULL;