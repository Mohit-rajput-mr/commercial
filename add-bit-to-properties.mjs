// Script to add unique 'bit' field to all property JSON files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const propertyFiles = [
  // Commercial files
  'public/commercial/commercial_dataset_17nov2025.json',
  'public/commercial/commercial_dataset_Chicago.json',
  'public/commercial/commercial_dataset_houston.json',
  'public/commercial/commercial_dataset_LA.json',
  'public/commercial/commercial_dataset_ny.json',
  'public/commercial/commercial_dataset2.json',
  'public/commercial/dataset_austin_lease.json',
  'public/commercial/dataset_austin_sale.json',
  'public/commercial/dataset_las_vegas_sale.json',
  'public/commercial/dataset_lasvegas_lease.json',
  'public/commercial/dataset_los_angeles_lease.json',
  'public/commercial/dataset_los_angeles_sale.json',
  'public/commercial/dataset_manhattan_ny.json',
  'public/commercial/dataset_miami_beach.json',
  'public/commercial/dataset_miami_sale.json',
  'public/commercial/dataset_miamibeach_lease.json',
  'public/commercial/dataset_philadelphia.json',
  'public/commercial/dataset_philadelphia_sale.json',
  'public/commercial/dataset_phoenix.json',
  'public/commercial/dataset_san_antonio_sale.json',
  'public/commercial/dataset_sanfrancisco_lease.json',
  'public/commercial/dataset_sanfrancisco_sale.json',
  'public/commercial/dataset_son_antonio_lease.json',
  'public/miami_all_crexi_lease.json',
  'public/miami_all_crexi_sale.json',
  
  // Residential sale files
  'public/residential/sale/chicago_sale.json',
  'public/residential/sale/houston_sale.json',
  'public/residential/sale/las_vegas_sale.json',
  'public/residential/sale/miami_beach_sale.json',
  'public/residential/sale/miami_sale.json',
  'public/residential/sale/new_york_sale.json',
  'public/residential/sale/philadelphia_sale.json',
  'public/residential/sale/phoenix_sale.json',
  'public/residential/sale/san-antonio_sale.json',
  
  // Residential lease files
  'public/residential/lease/chicago_rental.json',
  'public/residential/lease/houston_rental.json',
  'public/residential/lease/losangeles_rental.json',
  'public/residential/lease/miami_beach_rental.json',
  'public/residential/lease/miami_rental.json',
  'public/residential/lease/newyork_rental.json',
  'public/residential/lease/philadelphia_rental.json',
  'public/residential/lease/phoenix_rental.json',
  'public/residential/lease/san_antonio_rental.json',
];

let globalBitCounter = 1;

function processFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    console.log(`\n📄 Processing: ${filePath}`);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const propertiesArray = Array.isArray(data) ? data : (data.properties || []);
    
    if (propertiesArray.length === 0) {
      console.log(`   ⚠️  No properties found in ${filePath}`);
      return;
    }

    let fileBitCounter = 1;
    let updated = 0;

    propertiesArray.forEach((property, index) => {
      // Only add bit if it doesn't exist, or if it's 0/null/undefined
      if (!property.bit || property.bit === 0) {
        property.bit = globalBitCounter++;
        updated++;
      } else {
        // If bit exists, ensure it's within the global counter range
        if (property.bit >= globalBitCounter) {
          globalBitCounter = property.bit + 1;
        }
      }
    });

    // Write back to file
    const output = Array.isArray(data) ? propertiesArray : { ...data, properties: propertiesArray };
    fs.writeFileSync(fullPath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(`   ✅ Updated ${updated} properties with bit numbers (${propertiesArray.length} total)`);
    console.log(`   📊 Bit range: ${propertiesArray[0]?.bit || 'N/A'} - ${propertiesArray[propertiesArray.length - 1]?.bit || 'N/A'}`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🚀 Starting to add bit fields to all property JSON files...\n');

propertyFiles.forEach(processFile);

console.log(`\n✅ Complete! Total unique bits assigned: ${globalBitCounter - 1}`);
console.log('\n📝 Next steps:');
console.log('   1. Review the updated JSON files');
console.log('   2. Update property-loader.ts to use bit instead of index');
console.log('   3. Update property link generation code');

