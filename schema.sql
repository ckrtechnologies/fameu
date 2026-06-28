CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile          TEXT UNIQUE,
  email           TEXT UNIQUE,
  username        TEXT UNIQUE,
  display_name    TEXT,
  avatar_url      TEXT,
  role            TEXT NOT NULL CHECK (role IN ('artist','hiring','admin')),
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  is_blacklisted  BOOLEAN DEFAULT FALSE,
  fcm_token       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Supabase Auth Trigger: Automatically create public.users row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, mobile, role, display_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.phone,
    COALESCE(new.raw_user_meta_data->>'role', 'artist'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TABLE otp_store (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier  TEXT NOT NULL,
  otp         TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX ON otp_store(identifier);

CREATE TABLE artist_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name             TEXT,
  categories            TEXT[],
  age                   INT,
  gender                TEXT,
  height                TEXT,
  weight                TEXT,
  city                  TEXT,
  bio                   TEXT,
  experience            TEXT,
  languages             TEXT[],
  skills                TEXT[],
  avatar_url            TEXT,
  photo_urls            TEXT[],
  video_url             TEXT,
  resume_url            TEXT,
  audio_url             TEXT,
  social_links          JSONB,
  is_verified           BOOLEAN DEFAULT FALSE,
  verification_status   TEXT DEFAULT 'unverified',
  profile_complete_pct  INT DEFAULT 0,
  travel_available      BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE actor_details (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id   UUID UNIQUE REFERENCES artist_profiles(id) ON DELETE CASCADE,
  body_type   TEXT,
  skin_tone   TEXT,
  hair_color  TEXT,
  eye_color   TEXT,
  acting_exp  TEXT,
  monologue_url TEXT
);

CREATE TABLE singer_details (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id     UUID UNIQUE REFERENCES artist_profiles(id) ON DELETE CASCADE,
  singing_genre TEXT[],
  vocal_range   TEXT,
  instruments   TEXT[],
  singing_exp   TEXT
);

CREATE TABLE model_details (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       UUID UNIQUE REFERENCES artist_profiles(id) ON DELETE CASCADE,
  measurements    TEXT,
  shoe_size       TEXT,
  ramp_exp        TEXT,
  brand_history   TEXT
);

CREATE TABLE dancer_details (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       UUID UNIQUE REFERENCES artist_profiles(id) ON DELETE CASCADE,
  dance_styles    TEXT[],
  training        TEXT,
  competition_history TEXT,
  certifications  TEXT[]
);

CREATE TABLE technician_details (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       UUID UNIQUE REFERENCES artist_profiles(id) ON DELETE CASCADE,
  sub_category    TEXT,
  equipment       TEXT,
  software_skills TEXT[],
  work_exp        TEXT
);

CREATE TABLE hiring_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name        TEXT NOT NULL,
  company_type        TEXT NOT NULL,
  logo_url            TEXT,
  description         TEXT,
  social_links        JSONB,
  is_verified         BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending',
  credits             INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verification_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hiring_id       UUID REFERENCES hiring_profiles(id) ON DELETE CASCADE,
  aadhaar_url     TEXT,
  pan_url         TEXT,
  company_reg_url TEXT,
  gst_url         TEXT,
  selfie_url      TEXT,
  status          TEXT DEFAULT 'pending',
  reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  review_note     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auditions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hiring_id       UUID REFERENCES hiring_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  role_description TEXT,
  character_req   TEXT,
  category        TEXT,
  language        TEXT[],
  age_min         INT,
  age_max         INT,
  gender          TEXT,
  audition_type   TEXT CHECK (audition_type IN ('walkin','scheduled')),
  venue_address   TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  audition_date   DATE,
  date            DATE,
  audition_time   TIME,
  compensation    TEXT,
  required_docs   TEXT,
  instructions    TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
  view_count      INT DEFAULT 0,
  is_live         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON auditions(status, category, audition_date);
CREATE INDEX ON auditions(lat, lng);
CREATE INDEX ON auditions(created_at DESC);

CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audition_id     UUID REFERENCES auditions(id) ON DELETE CASCADE,
  artist_id       UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  cover_note      TEXT,
  selected_video  TEXT,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','shortlisted','rejected','interview_scheduled','hired')),
  interview_date  TIMESTAMPTZ,
  interview_venue TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(audition_id, artist_id)
);

CREATE TABLE bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id   UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  audition_id UUID REFERENCES auditions(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, audition_id)
);

CREATE TABLE fraud_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  audition_id  UUID REFERENCES auditions(id) ON DELETE CASCADE,
  reason       TEXT NOT NULL,
  status       TEXT DEFAULT 'open',
  action_taken TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hiring_id   UUID REFERENCES hiring_profiles(id) ON DELETE SET NULL,
  order_id    TEXT UNIQUE NOT NULL,
  amount      NUMERIC DEFAULT 10,
  currency    TEXT DEFAULT 'INR',
  type        TEXT,
  status      TEXT DEFAULT 'pending',
  gateway_ref TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON notifications(user_id, is_read);

CREATE TABLE cms_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  value       JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO cms_content (key, value) VALUES
  ('banner', '[]'),
  ('faq', '[]'),
  ('terms', '""'),
  ('privacy', '""');

CREATE TABLE blacklist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  reason      TEXT,
  added_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date   DATE UNIQUE,
  date            DATE,
  total_artists   INT,
  total_hiring    INT,
  active_auditions INT,
  total_apps      INT,
  revenue         NUMERIC,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION increment_credits(company_id UUID)
RETURNS VOID AS $$
  UPDATE hiring_profiles SET credits = credits + 1 WHERE id = company_id;
$$ LANGUAGE SQL;

-- ==========================================
-- SOCIAL FEATURES (FOLLOWERS & CHAT)
-- ==========================================

CREATE TABLE followers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
CREATE INDEX ON followers(following_id);
CREATE INDEX ON followers(follower_id);

CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID,
  participant2_id UUID,
  last_message    TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_participant1 FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_participant2 FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON messages(conversation_id, created_at DESC);

CREATE TABLE checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  audition_id     UUID REFERENCES auditions(id) ON DELETE CASCADE,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Connections (Followers)
CREATE TABLE connections (
  follower_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);
CREATE INDEX ON connections(follower_id);
CREATE INDEX ON connections(following_id);

-- Triggers to update followers_count and following_count
CREATE OR REPLACE FUNCTION update_connection_counts()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_connection_change
  AFTER INSERT OR DELETE ON connections
  FOR EACH ROW EXECUTE PROCEDURE update_connection_counts();
