-- Complete Fix for Property Type Constraint
-- This will check, update, and fix everything

-- Step 1: Check current constraint (to see what it allows)
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'properties'::regclass
AND conname LIKE '%property_type%';

-- Step 2: Check what property types currently exist
SELECT DISTINCT property_type, COUNT(*) as count 
FROM properties 
GROUP BY property_type 
ORDER BY property_type;

-- Step 3: Update ALL existing properties to valid types
-- Convert old commercial types to 'Commercial'
UPDATE properties 
SET property_type = 'Commercial' 
WHERE property_type IN ('Office', 'Retail', 'Industrial', 'Flex', 'Coworking', 'Medical', 'Land', 'Other');

-- Convert old residential types to 'Residential'
UPDATE properties 
SET property_type = 'Residential' 
WHERE property_type IN ('Condo', 'House', 'Multi-Family');

-- Convert any NULL or empty values to 'Commercial'
UPDATE properties 
SET property_type = 'Commercial' 
WHERE property_type IS NULL OR property_type = '';

-- Convert any other invalid types to 'Commercial'
UPDATE properties 
SET property_type = 'Commercial' 
WHERE property_type NOT IN ('Residential', 'Commercial');

-- Step 4: Drop ALL constraints related to property_type
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'properties'::regclass 
        AND conname LIKE '%property_type%'
    ) LOOP
        EXECUTE 'ALTER TABLE properties DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Step 5: Add new constraint with only Residential and Commercial
ALTER TABLE properties ADD CONSTRAINT properties_property_type_check 
  CHECK (property_type IN ('Residential', 'Commercial'));

-- Step 6: Verify the constraint was added correctly
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'properties'::regclass
AND conname = 'properties_property_type_check';

-- Step 7: Verify all property types are valid
SELECT DISTINCT property_type, COUNT(*) as count 
FROM properties 
GROUP BY property_type 
ORDER BY property_type;

