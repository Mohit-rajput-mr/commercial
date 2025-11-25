-- Fix Property Type Constraint
-- Run this in Supabase SQL Editor to update the existing constraint

-- Drop the old constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;

-- Add new constraint with only Residential and Commercial
ALTER TABLE properties ADD CONSTRAINT properties_property_type_check 
  CHECK (property_type IN ('Residential', 'Commercial'));

-- Optional: Update existing properties to match new types
-- Convert old types to Commercial (you can customize this logic)
UPDATE properties 
SET property_type = 'Commercial' 
WHERE property_type IN ('Office', 'Retail', 'Industrial', 'Flex', 'Coworking', 'Medical', 'Land', 'Other');

-- Convert residential types to Residential
UPDATE properties 
SET property_type = 'Residential' 
WHERE property_type IN ('Condo', 'House', 'Multi-Family');

-- Verify the constraint
SELECT DISTINCT property_type FROM properties;






