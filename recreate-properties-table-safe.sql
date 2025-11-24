-- Safe Recreation of Properties Table
-- This handles orphaned records in related tables

-- Step 1: Delete orphaned records from related tables
-- (Records that reference properties that don't exist)
DELETE FROM activities WHERE property_id IS NOT NULL 
  AND property_id NOT IN (SELECT id FROM properties);

DELETE FROM favorites WHERE property_id IS NOT NULL 
  AND property_id NOT IN (SELECT id FROM properties);

DELETE FROM inquiries WHERE property_id IS NOT NULL 
  AND property_id NOT IN (SELECT id FROM properties);

DELETE FROM chats WHERE property_id IS NOT NULL 
  AND property_id NOT IN (SELECT id FROM properties);

DELETE FROM property_views WHERE property_id IS NOT NULL 
  AND property_id NOT IN (SELECT id FROM properties);

-- Step 2: Drop foreign key constraints from other tables
ALTER TABLE IF EXISTS favorites DROP CONSTRAINT IF EXISTS favorites_property_id_fkey;
ALTER TABLE IF EXISTS inquiries DROP CONSTRAINT IF EXISTS inquiries_property_id_fkey;
ALTER TABLE IF EXISTS chats DROP CONSTRAINT IF EXISTS chats_property_id_fkey;
ALTER TABLE IF EXISTS activities DROP CONSTRAINT IF EXISTS activities_property_id_fkey;
ALTER TABLE IF EXISTS property_views DROP CONSTRAINT IF EXISTS property_views_property_id_fkey;

-- Step 3: Drop the properties table
DROP TABLE IF EXISTS properties CASCADE;

-- Step 4: Recreate the properties table with correct constraint
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zpid TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  
  -- Pricing
  price NUMERIC,
  price_text TEXT,
  
  -- Property Details
  status TEXT NOT NULL CHECK (status IN ('For Lease', 'For Sale', 'Auctions', 'Businesses For Sale', 'LandForAuction')),
  property_type TEXT NOT NULL CHECK (property_type IN ('Residential', 'Commercial')),
  
  beds INTEGER,
  baths NUMERIC,
  sqft INTEGER,
  living_area INTEGER,
  lot_size INTEGER,
  year_built INTEGER,
  
  -- Description & Features
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Media
  images JSONB DEFAULT '[]'::jsonb,
  virtual_tour_url TEXT,
  
  -- Location
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Contact
  contact_name TEXT DEFAULT 'Leo Jo',
  contact_email TEXT DEFAULT 'leojoemail@gmail.com',
  contact_phone TEXT DEFAULT '+1 (917) 209-6200',
  
  -- Metadata
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  listing_url TEXT,
  source TEXT DEFAULT 'manual',
  
  -- Timestamps
  listed_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Full-text search
  search_vector TSVECTOR
);

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_properties_zpid ON properties(zpid);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN(search_vector);

-- Step 6: Recreate full-text search trigger
CREATE OR REPLACE FUNCTION properties_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.state, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.zip, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_search_update ON properties;
CREATE TRIGGER properties_search_update 
  BEFORE INSERT OR UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION properties_search_trigger();

-- Step 7: Recreate updated_at trigger
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Recreate foreign key constraints
ALTER TABLE favorites ADD CONSTRAINT favorites_property_id_fkey 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE inquiries ADD CONSTRAINT inquiries_property_id_fkey 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE chats ADD CONSTRAINT chats_property_id_fkey 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

ALTER TABLE activities ADD CONSTRAINT activities_property_id_fkey 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

ALTER TABLE property_views ADD CONSTRAINT property_views_property_id_fkey 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- Step 9: Re-enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Step 10: Recreate RLS policies
DROP POLICY IF EXISTS "Anyone can view active properties" ON properties;
CREATE POLICY "Anyone can view active properties" ON properties
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage properties" ON properties;
CREATE POLICY "Admins can manage properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Step 11: Verify the table was created correctly
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

-- Verify constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'properties'::regclass
AND conname = 'properties_property_type_check';

