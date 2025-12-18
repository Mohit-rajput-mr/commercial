/**
 * Utility to parse property description and organize into structured sections
 */

export interface PropertySection {
  title: string;
  items: { label: string; value: string }[];
}

export interface ParsedPropertyDetails {
  overview: PropertySection;
  interior: PropertySection;
  exterior: PropertySection;
  parking: PropertySection;
  hoa: PropertySection;
  schools: PropertySection;
  taxes: PropertySection;
  other: PropertySection;
}

/**
 * Parse property description string into organized sections
 */
export function parsePropertyDescription(description: string): ParsedPropertyDetails {
  const sections: ParsedPropertyDetails = {
    overview: { title: 'Property Overview', items: [] },
    interior: { title: 'Interior Features', items: [] },
    exterior: { title: 'Exterior Features', items: [] },
    parking: { title: 'Parking & Garage', items: [] },
    hoa: { title: 'HOA & Association', items: [] },
    schools: { title: 'School Information', items: [] },
    taxes: { title: 'Tax Information', items: [] },
    other: { title: 'Additional Information', items: [] },
  };

  if (!description) return sections;

  // Split by periods and process each item
  const items = description.split(/\.\s+/).filter(item => item.trim());

  items.forEach(item => {
    const trimmed = item.trim();
    if (!trimmed) return;

    // Bedrooms (handle "Bedrooms: 4" and "Bedrooms Possible: 4")
    if (trimmed.match(/Bedrooms?/i)) {
      if (trimmed.match(/Bedrooms?:\s*(\d+)/i)) {
        const match = trimmed.match(/Bedrooms?:\s*(\d+)/i);
        if (match) sections.overview.items.push({ label: 'Bedrooms', value: match[1] });
      } else if (trimmed.match(/Bedrooms Possible:\s*(\d+)/i)) {
        const match = trimmed.match(/Bedrooms Possible:\s*(\d+)/i);
        if (match) sections.overview.items.push({ label: 'Bedrooms Possible', value: match[1] });
      }
      // Handle bedroom dimensions
      if (trimmed.match(/Bedroom \d+ Dimensions:/i)) {
        const match = trimmed.match(/(Bedroom \d+)\s+Dimensions:\s*(.+)/i);
        if (match) sections.interior.items.push({ label: match[1], value: match[2] });
      } else if (trimmed.match(/Primary Bedroom Dimensions:/i)) {
        const match = trimmed.match(/Primary Bedroom Dimensions:\s*(.+)/i);
        if (match) sections.interior.items.push({ label: 'Primary Bedroom', value: match[1] });
      }
      // Handle bedroom level
      if (trimmed.match(/Bedroom \d+ Level:/i)) {
        const match = trimmed.match(/(Bedroom \d+)\s+Level:\s*(.+)/i);
        if (match) sections.interior.items.push({ label: `${match[1]} Level`, value: match[2] });
      } else if (trimmed.match(/Primary Bedroom Level:/i)) {
        const match = trimmed.match(/Primary Bedroom Level:\s*(.+)/i);
        if (match) sections.interior.items.push({ label: 'Primary Bedroom Level', value: match[1] });
      }
      return;
    }

    // Bathrooms (handle "Total Bathrooms", "Full Bathrooms", "1/2 Bathrooms")
    if (trimmed.match(/Bathrooms?/i)) {
      if (trimmed.match(/Total Bathrooms?:\s*(\d+)/i)) {
        const match = trimmed.match(/Total Bathrooms?:\s*(\d+)/i);
        if (match) sections.overview.items.push({ label: 'Total Bathrooms', value: match[1] });
      } else if (trimmed.match(/Full Bathrooms?:\s*(\d+)/i)) {
        const match = trimmed.match(/Full Bathrooms?:\s*(\d+)/i);
        if (match) sections.overview.items.push({ label: 'Full Bathrooms', value: match[1] });
      } else if (trimmed.match(/\d+\/\d+\s+Bathrooms?:\s*(\d+)/i)) {
        const match = trimmed.match(/(\d+\/\d+\s+Bathrooms?):\s*(\d+)/i);
        if (match) sections.overview.items.push({ label: match[1], value: match[2] });
      }
      return;
    }

    // Total Rooms
    if (trimmed.match(/Total Rooms?:/i)) {
      const match = trimmed.match(/Total Rooms?:\s*(\d+)/i);
      if (match) sections.overview.items.push({ label: 'Total Rooms', value: match[1] });
      return;
    }

    // Room types and dimensions (Living Room, Dining Room, Kitchen, Family Room, etc.)
    if (trimmed.match(/Room|Kitchen|Dining|Living|Family|Office|Sitting|Exercise|Balcony|Porch|Lanai/i)) {
      // Room dimensions
      if (trimmed.match(/(Living Room|Dining Room|Kitchen|Family Room|Office\/Study Room|Sitting Room|Exercise Room|Balcony\/Porch\/Lanai)\s+Dimensions:\s*(.+)/i)) {
        const match = trimmed.match(/(.+?)\s+Dimensions:\s*(.+)/i);
        if (match) {
          sections.interior.items.push({ label: match[1].trim(), value: match[2] });
        }
        return;
      }
      // Room level
      if (trimmed.match(/(Living Room|Dining Room|Kitchen|Family Room|Office\/Study Room|Sitting Room|Exercise Room|Balcony\/Porch\/Lanai)\s+Level:\s*(.+)/i)) {
        const match = trimmed.match(/(.+?)\s+Level:\s*(.+)/i);
        if (match) {
          sections.interior.items.push({ label: `${match[1].trim()} Level`, value: match[2] });
        }
        return;
      }
      // Room features (Office: Yes, Exercise Room: Yes)
      if (trimmed.match(/(Office|Exercise Room|Storage):\s*(Yes|No)/i)) {
        const match = trimmed.match(/(.+?):\s*(.+)/i);
        if (match) {
          sections.interior.items.push({ label: match[1].trim(), value: match[2] });
        }
        return;
      }
    }

    // Year Built
    if (trimmed.match(/Year Built:/i)) {
      const match = trimmed.match(/Year Built:\s*(.+)/i);
      if (match) sections.overview.items.push({ label: 'Year Built', value: match[1] });
      return;
    }

    // Square Feet
    if (trimmed.match(/Square Feet|Sqft|Sq\.?\s*Ft/i)) {
      const match = trimmed.match(/(.+?)\s*(?:Square Feet|Sqft|Sq\.?\s*Ft):\s*(.+)/i);
      if (match) {
        sections.overview.items.push({ label: match[1].trim() || 'Square Feet', value: match[2] });
      }
      return;
    }

    // Lot Size
    if (trimmed.match(/Lot Size/i)) {
      const match = trimmed.match(/Lot Size[^:]*:\s*(.+)/i);
      if (match) sections.exterior.items.push({ label: 'Lot Size', value: match[1] });
      return;
    }

    // Parking
    if (trimmed.match(/Parking|Garage/i)) {
      if (trimmed.match(/Parking Features:/i)) {
        const match = trimmed.match(/Parking Features:\s*(.+)/i);
        if (match) sections.parking.items.push({ label: 'Parking Features', value: match[1] });
      } else if (trimmed.match(/Garage Spaces:/i)) {
        const match = trimmed.match(/Garage Spaces:\s*(.+)/i);
        if (match) sections.parking.items.push({ label: 'Garage Spaces', value: match[1] });
      } else if (trimmed.match(/Parking Total:/i)) {
        const match = trimmed.match(/Parking Total:\s*(.+)/i);
        if (match) sections.parking.items.push({ label: 'Parking Total', value: match[1] });
      }
      return;
    }

    // HOA/Association
    if (trimmed.match(/Association|HOA/i)) {
      if (trimmed.match(/Association Fee:\s*(\d+)/i)) {
        const match = trimmed.match(/Association Fee:\s*(\d+)/i);
        if (match) {
          const fee = parseInt(match[1]).toLocaleString();
          sections.hoa.items.push({ label: 'Association Fee', value: `$${fee}` });
        }
      } else if (trimmed.match(/Association Fee Frequency:/i)) {
        const match = trimmed.match(/Association Fee Frequency:\s*(.+)/i);
        if (match) sections.hoa.items.push({ label: 'Fee Frequency', value: match[1] });
      } else if (trimmed.match(/Association Fee Includes:/i)) {
        const match = trimmed.match(/Association Fee Includes:\s*(.+)/i);
        if (match) sections.hoa.items.push({ label: 'Fee Includes', value: match[1] });
      } else if (trimmed.match(/Calculated Total Monthly Association Fees:\s*(\d+)/i)) {
        const match = trimmed.match(/Calculated Total Monthly Association Fees:\s*(\d+)/i);
        if (match) {
          const fee = parseInt(match[1]).toLocaleString();
          sections.hoa.items.push({ label: 'Total Monthly Fees', value: `$${fee}` });
        }
      } else if (trimmed.match(/Association Amenities:/i)) {
        const match = trimmed.match(/Association Amenities:\s*(.+)/i);
        if (match) sections.hoa.items.push({ label: 'Amenities', value: match[1] });
      } else if (trimmed.match(/Association:\s*(Yes|No)/i)) {
        const match = trimmed.match(/Association:\s*(.+)/i);
        if (match) sections.hoa.items.push({ label: 'Association', value: match[1] });
      }
      // Handle individual amenities listed separately
      else if (trimmed.match(/^(Bike Room|Door Person|Elevator|Exercise Room|Storage|Health Club|On Site Manager|Park|Party Room|Sundeck|Indoor Pool|Pool|Receiving Room|Restaurant|Sauna|Service Elevator|Steam Room|Valet\/Cleaner|Doorman):/i)) {
        const match = trimmed.match(/^(.+?):\s*(.+)/i);
        if (match) {
          // Check if amenities section exists, if not create it
          if (!sections.hoa.items.find(item => item.label === 'Amenities')) {
            sections.hoa.items.push({ label: 'Amenities', value: match[2] });
          } else {
            const existing = sections.hoa.items.find(item => item.label === 'Amenities');
            if (existing) {
              existing.value += `, ${match[2]}`;
            }
          }
        }
      }
      return;
    }

    // Schools
    if (trimmed.match(/School|District/i)) {
      const match = trimmed.match(/(.+?)\s*(?:School|District):\s*(.+)/i);
      if (match) {
        sections.schools.items.push({ label: match[1].trim(), value: match[2] });
      }
      return;
    }

    // Taxes
    if (trimmed.match(/Tax|Annual Tax/i)) {
      if (trimmed.match(/Annual Tax Amount:\s*(\d+)/i)) {
        const match = trimmed.match(/Annual Tax Amount:\s*(\d+)/i);
        if (match) {
          const tax = parseInt(match[1]).toLocaleString();
          sections.taxes.items.push({ label: 'Annual Tax Amount', value: `$${tax}` });
        }
      } else if (trimmed.match(/Tax Year:/i)) {
        const match = trimmed.match(/Tax Year:\s*(.+)/i);
        if (match) sections.taxes.items.push({ label: 'Tax Year', value: match[1] });
      }
      return;
    }

    // Heating/Cooling
    if (trimmed.match(/Heating|Cooling/i)) {
      if (trimmed.match(/Heating Features:/i)) {
        const match = trimmed.match(/Heating Features:\s*(.+)/i);
        if (match) sections.interior.items.push({ label: 'Heating', value: match[1] });
      } else if (trimmed.match(/Cooling Features:/i)) {
        const match = trimmed.match(/Cooling Features:\s*(.+)/i);
        if (match) sections.interior.items.push({ label: 'Cooling', value: match[1] });
      }
      return;
    }

    // Appliances (Double Oven, Microwave, Dishwasher, etc.)
    if (trimmed.match(/Double Oven|Microwave|Dishwasher|Refrigerator|Washer|Dryer|Disposal|Wine Refrigerator/i)) {
      if (!sections.interior.items.find(item => item.label === 'Appliances')) {
        sections.interior.items.push({ label: 'Appliances', value: trimmed });
      } else {
        // Append to existing appliances
        const existing = sections.interior.items.find(item => item.label === 'Appliances');
        if (existing) {
          existing.value += `, ${trimmed}`;
        }
      }
      return;
    }

    // Laundry Features
    if (trimmed.match(/Laundry Features:/i)) {
      const match = trimmed.match(/Laundry Features:\s*(.+)/i);
      if (match) sections.interior.items.push({ label: 'Laundry Features', value: match[1] });
      return;
    }

    // Washer Dryer Hookup
    if (trimmed.match(/Washer Dryer Hookup:/i)) {
      const match = trimmed.match(/Washer Dryer Hookup:\s*(.+)/i);
      if (match) sections.interior.items.push({ label: 'Washer/Dryer Hookup', value: match[1] });
      return;
    }

    // Flooring
    if (trimmed.match(/Flooring:/i)) {
      const match = trimmed.match(/Flooring:\s*(.+)/i);
      if (match) sections.interior.items.push({ label: 'Flooring', value: match[1] });
      return;
    }

    // Construction
    if (trimmed.match(/Construction|Structure Type/i)) {
      const match = trimmed.match(/(.+?):\s*(.+)/i);
      if (match) sections.exterior.items.push({ label: match[1].trim(), value: match[2] });
      return;
    }

    // Property Type/Subtype
    if (trimmed.match(/Property (?:Sub)?Type|Ownership/i)) {
      const match = trimmed.match(/(.+?):\s*(.+)/i);
      if (match) sections.overview.items.push({ label: match[1].trim(), value: match[2] });
      return;
    }

    // County/Area/Neighborhood
    if (trimmed.match(/County:|Area:|Neighborhood:|Township:/i)) {
      const match = trimmed.match(/(.+?):\s*(.+)/i);
      if (match) sections.other.items.push({ label: match[1].trim(), value: match[2] });
      return;
    }

    // Directions
    if (trimmed.match(/Directions:/i)) {
      const match = trimmed.match(/Directions:\s*(.+)/i);
      if (match) sections.other.items.push({ label: 'Directions', value: match[1] });
      return;
    }

    // Pets
    if (trimmed.match(/Pets Allowed|Cats|Dogs/i)) {
      const match = trimmed.match(/(.+?):\s*(.+)/i);
      if (match) sections.hoa.items.push({ label: match[1].trim(), value: match[2] });
      return;
    }

    // Standalone room/feature mentions (Office, Exercise Room, Storage, etc.)
    if (trimmed.match(/^(Office|Exercise Room|Storage|Sitting Room|Balcony\/Porch\/Lanai)$/i)) {
      sections.interior.items.push({ label: trimmed, value: 'Yes' });
      return;
    }

    // Everything else with colons goes to other
    if (trimmed.includes(':')) {
      const match = trimmed.match(/(.+?):\s*(.+)/i);
      if (match) {
        const label = match[1].trim();
        const value = match[2].trim();
        
        // Skip if already processed
        if (!label.match(/Bedrooms?|Bathrooms?|Rooms?|Dimensions|Level|Parking|Garage|Association|HOA|School|District|Tax|Heating|Cooling|Flooring|Construction|Property|Ownership|County|Area|Neighborhood|Township|Directions|Pets|Cats|Dogs/i)) {
          sections.other.items.push({ label, value });
        }
      }
    }
  });

  return sections;
}

