-- Update Property Type Constraint to Residential and Commercial only

-- Step 1: Update existing properties to new types
UPDATE properties 
SET property_type = 'Commercial' 
WHERE property_type IN ('Office', 'Retail', 'Industrial', 'Flex', 'Coworking', 'Medical', 'Land', 'Other');

UPDATE properties 
SET property_type = 'Residential' 
WHERE property_type IN ('Condo', 'House', 'Multi-Family');

-- Step 2: Drop the old constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;

-- Step 3: Add new constraint with only Residential and Commercial
ALTER TABLE properties ADD CONSTRAINT properties_property_type_check 
  CHECK (property_type = ANY (ARRAY['Residential'::text, 'Commercial'::text]));






