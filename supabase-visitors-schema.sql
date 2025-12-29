-- Visitors tracking table schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  ip_address TEXT,
  -- Anonymized location data (city/region level, not exact coordinates)
  country TEXT,
  country_code TEXT,
  city TEXT,
  region TEXT,
  -- Device information
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  -- Visit information
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  language TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  -- Tracking metadata
  is_new_visitor BOOLEAN DEFAULT true,
  visit_count INTEGER DEFAULT 1,
  session_start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end_at TIMESTAMP WITH TIME ZONE,
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_visitors_city ON visitors(city);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_device_type ON visitors(device_type);
CREATE INDEX IF NOT EXISTS idx_visitors_country_code ON visitors(country_code);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admins can read visitor data
CREATE POLICY "Admins can view visitors" ON visitors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Note: The API routes use supabaseAdmin (service role) which bypasses RLS
-- Service role access is handled automatically by Supabase and doesn't need a policy

