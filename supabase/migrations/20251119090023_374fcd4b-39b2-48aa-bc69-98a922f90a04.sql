-- Enable realtime updates for responses table
ALTER TABLE public.responses REPLICA IDENTITY FULL;

-- Add responses table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;