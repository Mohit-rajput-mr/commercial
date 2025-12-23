# Bit Field Setup Instructions

This document explains how to add unique `bit` fields to all property JSON files and update the system to use them.

## Overview

Each property in all JSON files now has a unique `bit` field (sequential number starting from 1). This ensures that property links are stable and shareable, regardless of array position or file shuffling.

## Step 1: Add Bit Fields to JSON Files

Run the script to add `bit` fields to all property JSON files:

```bash
node add-bit-to-properties.mjs
```

This script will:
- Add a unique `bit` field to each property in all 23+ JSON files
- Number properties sequentially across all files (1, 2, 3, ...)
- Preserve existing `bit` values if they already exist
- Update files in place

## Step 2: Verify the Changes

After running the script, verify that:
1. All JSON files have been updated
2. Each property has a `bit` field
3. Bit numbers are sequential and unique

Example property structure after update:
```json
{
  "bit": 123,
  "propertyId": "37904116",
  "listingType": "PropertyForAuction",
  "address": "1215 Race St",
  ...
}
```

## Step 3: Code Updates (Already Complete)

The following code has been updated to use `bit` instead of array indices:

1. **`src/lib/property-loader.ts`**
   - `parsePropertyId()` now parses `bit` instead of `index`
   - `loadResidentialPropertyFromDataset()` searches by `bit` number
   - `loadCommercialPropertyFromDataset()` supports bit-based lookup

2. **`src/app/jsondetailinfo/page.tsx`**
   - Updated to use `bit` when loading properties from datasets

3. **`src/app/residential/page.tsx`**
   - Property links now use `bit` in URLs
   - Format: `sale_Miami, FL_123` (where 123 is the bit number)

4. **`src/app/unified-search/page.tsx`**
   - Property links now use `bit` in URLs

## Property URL Format

Property URLs now use the format:
```
/jsondetailinfo?id=sale_Miami%2C%20FL_123
```

Where:
- `sale` or `lease` = listing type
- `Miami, FL` = location (can contain commas/spaces)
- `123` = unique bit number

## Benefits

1. **Stable Links**: Property links remain valid even if:
   - Properties are reordered in JSON files
   - Files are shuffled or filtered
   - Properties are moved between files

2. **Shareable**: Links work when:
   - Opened in new tabs
   - Shared via email/social media
   - Bookmarked

3. **Unique Identification**: Each property has a globally unique identifier

## Troubleshooting

If properties don't load correctly:

1. **Check bit field exists**: Ensure all JSON files have `bit` fields
2. **Check bit values**: Verify bit numbers are positive integers (1, 2, 3, ...)
3. **Check console logs**: Look for parsing errors in browser console
4. **Fallback behavior**: Code falls back to index-based lookup if `bit` is missing

## Notes

- The script preserves existing `bit` values if they exist
- Bit numbers are assigned sequentially across all files
- Commercial and residential properties share the same bit number space
- The system gracefully handles missing `bit` fields (falls back to index)

