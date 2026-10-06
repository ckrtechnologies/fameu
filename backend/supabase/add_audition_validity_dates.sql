-- Add validity from and till dates for auditions
ALTER TABLE public.auditions
  ADD COLUMN IF NOT EXISTS valid_from DATE,
  ADD COLUMN IF NOT EXISTS valid_till DATE;

-- Backfill existing auditions:
-- valid_from defaults to created_at::date
-- valid_till defaults to date (if set) or (created_at + 30 days)
UPDATE public.auditions
SET 
  valid_from = COALESCE(valid_from, created_at::date),
  valid_till = COALESCE(valid_till, date, (created_at + INTERVAL '30 days')::date)
WHERE valid_from IS NULL OR valid_till IS NULL;

-- Index for querying active auditions within validity range
CREATE INDEX IF NOT EXISTS idx_auditions_validity ON public.auditions(status, valid_from, valid_till);

COMMENT ON COLUMN public.auditions.valid_from IS 'Start date from which the audition post is valid and accepting applications.';
COMMENT ON COLUMN public.auditions.valid_till IS 'End / closing date until which the audition post remains open.';
