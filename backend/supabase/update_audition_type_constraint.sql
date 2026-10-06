-- Migration: Allow 'online' in auditions table audition_type check constraint
-- Fixes "new row for relation auditions violates check constraint" when creating online auditions or direct applications

DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'auditions_audition_type_check'
  ) THEN
    ALTER TABLE public.auditions DROP CONSTRAINT auditions_audition_type_check;
  END IF;

  -- Add updated constraint including 'online'
  ALTER TABLE public.auditions 
    ADD CONSTRAINT auditions_audition_type_check 
    CHECK (audition_type IN ('walkin', 'scheduled', 'online'));
END $$;
