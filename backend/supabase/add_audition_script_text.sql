-- Add script_text column to auditions table
ALTER TABLE public.auditions
  ADD COLUMN IF NOT EXISTS script_text TEXT;

COMMENT ON COLUMN public.auditions.script_text 
  IS 'Direct dialogue, monologue, or scene sides script for the audition.';
