-- Migration: Add visit_count column to profile_visits table
-- Purpose: Track how many times each visitor views a profile

ALTER TABLE public.profile_visits
  ADD COLUMN IF NOT EXISTS visit_count INT DEFAULT 1;

COMMENT ON COLUMN public.profile_visits.visit_count
  IS 'Frequency counter for how many times viewer_id viewed profile_user_id.';
