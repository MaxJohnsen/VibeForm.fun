-- Enable realtime for answers table
ALTER TABLE answers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;