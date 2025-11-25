-- Fix Property Type Constraint for Properties Table
-- Run this query in Supabase SQL Editor

-- Step 1: Drop the old constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;

-- Step 2: Add new constraint with only Residential and Commercial
ALTER TABLE properties ADD CONSTRAINT properties_property_type_check 
  CHECK (property_type IN ('Residential', 'Commercial'));

-- Step 3: Update existing properties to match new types
-- Convert old commercial types to 'Commercial'
UPDATE properties 
SET property_type = 'Commercial' 
WHERE property_type IN ('Office', 'Retail', 'Industrial', 'Flex', 'Coworking', 'Medical', 'Land', 'Other');

-- Convert old residential types to 'Residential'
UPDATE properties 
SET property_type = 'Residential' 
WHERE property_type IN ('Condo', 'House', 'Multi-Family');

-- Step 4: Verify - Check all property types (optional)
SELECT DISTINCT property_type, COUNT(*) as count 
FROM properties 
GROUP BY property_type 
ORDER BY property_type;






