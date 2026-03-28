-- Migration: Create applications and licenses tables
-- Description: Initial schema for the license management system

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  license_key     TEXT NOT NULL UNIQUE,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_application_id ON licenses(application_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key    ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status         ON licenses(status);

-- Trigger to auto-update updated_at on applications
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
-- Enable RLS on both tables. Adjust policies to match your auth strategy.
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses     ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated users (adjust as needed)
CREATE POLICY "Allow all for authenticated users" ON applications
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON licenses
  FOR ALL USING (auth.role() = 'authenticated');
