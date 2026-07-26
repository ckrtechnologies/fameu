ALTER TABLE public.verification_documents ADD COLUMN IF NOT EXISTS passport_url TEXT;
ALTER TABLE public.verification_documents ADD COLUMN IF NOT EXISTS voter_id_url TEXT;
ALTER TABLE public.verification_documents ADD COLUMN IF NOT EXISTS driving_license_url TEXT;

ALTER TABLE public.hiring_profiles ADD COLUMN IF NOT EXISTS alternate_contact JSONB;
