ALTER TABLE users ADD COLUMN IF NOT EXISTS disclaimer_accepted BOOLEAN DEFAULT FALSE;

ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS is_cintaa_member BOOLEAN DEFAULT FALSE;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS cintaa_reg_number TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS availability_type TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS available_dates JSONB;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS work_preference TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS preferred_cities TEXT[];
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS look_alike TEXT[];
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS hashtags TEXT[];
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS intro_video_url TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS left_profile_url TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS right_profile_url TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS recent_assignments JSONB;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS alternate_phone TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS alternate_email TEXT;

ALTER TABLE fraud_reports ADD COLUMN IF NOT EXISTS reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE;
