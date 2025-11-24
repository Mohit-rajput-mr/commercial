-- Fix Property Type Constraint - Safe Version
-- This updates existing data FIRST, then changes the constraint
-- Run this query in Supabase SQL Editor

-- Step 1: Update existing properties to match new types FIRST
-- Convert old commercial types to 'Commercial'
UPDATE properties 
SET property_type = 'Commercial' 
WHERE property_type IN ('Office', 'Retail', 'Industrial', 'Flex', 'Coworking', 'Medical', 'Land', 'Other');

-- Convert old residential types to 'Residential'
UPDATE properties 
SET property_type = 'Residential' 
WHERE property_type IN ('Condo', 'House', 'Multi-Family');

-- Step 2: Check if there are any other property types that need to be handled
-- This will show you any remaining invalid types
SELECT DISTINCT property_type, COUNT(*) as count 
FROM properties 
WHERE property_type NOT IN ('Residential', 'Commercial')
GROUP BY property_type;

-- Step 3: If the above query returns any rows, update them too
-- (Uncomment and modify if needed)
-- UPDATE properties 
-- SET property_type = 'Commercial' 
-- WHERE property_type NOT IN ('Residential', 'Commercial');

-- Step 4: Now drop the old constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;

-- Step 5: Add new constraint with only Residential and Commercial
ALTER TABLE properties ADD CONSTRAINT properties_property_type_check 
  CHECK (property_type IN ('Residential', 'Commercial'));

-- Step 6: Verify - Check all property types
SELECT DISTINCT property_type, COUNT(*) as count 
FROM properties 
GROUP BY property_type 
ORDER BY property_type;

