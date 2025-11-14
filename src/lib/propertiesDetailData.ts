import { PropertyDetail } from '@/types/propertyDetail';
import { allProperties } from '@/data/sampleProperties';

// Convert existing properties to PropertyDetail format with extended data
export function getPropertyDetailById(id: string): PropertyDetail | undefined {
  const property = allProperties.find(p => p.id === id);
  if (!property) return undefined;

  // Generate extended property detail data
  const has3DTour = Math.random() > 0.5; // Random for demo
  const propertyDetail: PropertyDetail = {
    ...property,
    title: `${property.address} - ${property.agent.company}`,
    subtitle: `${property.type} Available in ${property.city}, ${property.state} ${property.zipCode}`,
    has3DTour: has3DTour,
    tourUrl: has3DTour ? `https://matterport.com/tour/${id}` : undefined,
    
    imageGallery: [
      ...property.images.map((url, index) => ({
        url,
        alt: `${property.type} - ${property.address} - Image ${index + 1}`,
        type: index === 0 ? 'exterior' as const : index % 2 === 0 ? 'interior' as const : 'amenity' as const,
      })),
      {
        url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80',
        alt: `${property.address} - Aerial View`,
        type: 'aerial' as const,
      },
    ],
    
    transportation: {
      transit: [
        {
          name: 'Union Station',
          lines: ['Blue', 'Red'],
          walkTime: '5 min walk',
          distance: '0.3 mi',
        },
        {
          name: 'Civic Center',
          lines: ['Green', 'Yellow'],
          walkTime: '8 min walk',
          distance: '0.5 mi',
        },
      ],
      commuterRail: [
        {
          name: 'Amtrak Station',
          walkTime: '10 min walk',
          distance: '0.6 mi',
        },
      ],
      airport: {
        name: 'Denver International Airport (DEN)',
        driveTime: '25 min',
        distance: '23.5 mi',
      },
    },
    
    nearbyAmenities: {
      restaurants: [
        {
          name: 'The Capital Grille',
          cuisine: 'Steakhouse',
          priceRange: '$$$',
          distance: '0.2 mi',
        },
        {
          name: 'Panera Bread',
          cuisine: 'Cafe',
          priceRange: '$',
          distance: '0.1 mi',
        },
        {
          name: 'Olive Garden',
          cuisine: 'Italian',
          priceRange: '$$',
          distance: '0.3 mi',
        },
      ],
    },
    
    amenities: [
      '24-Hour Access',
      'Conference Room',
      'Convenience Store',
      'Fitness Center',
      'Onsite Manager',
      'Restaurant',
      'Energy Star Labeled',
      'Kitchen',
      'Reception',
      'Roof Terrace',
      'Natural Light',
      'Plug & Play',
      'Air Conditioning',
    ],
    
    owner: {
      name: property.agent.company,
      logo: property.agent.companyLogo,
      description: `${property.agent.company} is a leading commercial real estate company specializing in ${property.type.toLowerCase()} properties. We provide exceptional service and have a proven track record of successful transactions.`,
      website: `https://${property.agent.company.toLowerCase().replace(/\s+/g, '')}.com`,
    },
    
    relatedProperties: allProperties
      .filter(p => p.id !== id && p.type === property.type)
      .slice(0, 4)
      .map(p => p.id),
    
    metadata: {
      listingId: `CR-${id.padStart(6, '0')}`,
      dateOnMarket: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      lastUpdated: new Date().toLocaleDateString(),
    },
    
    location: {
      lat: property.coordinates?.lat || 39.7392,
      lng: property.coordinates?.lng || -104.9903,
      mapUrl: `https://www.google.com/maps?q=${property.coordinates?.lat || 39.7392},${property.coordinates?.lng || -104.9903}`,
    },
    
    // Add schools data
    schools: [
      {
        name: 'Lincoln Elementary School',
        rating: 9,
        type: 'Public',
        grades: 'K-5',
        distance: '0.5 mi',
      },
      {
        name: 'Roosevelt Middle School',
        rating: 7,
        type: 'Public',
        grades: '6-8',
        distance: '1.2 mi',
      },
      {
        name: 'Washington High School',
        rating: 8,
        type: 'Public',
        grades: '9-12',
        distance: '2.1 mi',
      },
      {
        name: 'Jefferson Elementary School',
        rating: 6,
        type: 'Public',
        grades: 'K-5',
        distance: '1.8 mi',
      },
    ],
    
    // Add property stats
    beds: property.type === 'Office' ? Math.floor(Math.random() * 20) + 5 : 0,
    baths: property.type === 'Office' ? Math.floor(Math.random() * 15) + 5 : 0,
    priceValue: property.pricePerSF * (property.sizeRange?.max || 1000),
    status: 'Coming Soon',
    daysOnMarket: Math.floor(Math.random() * 90),
    taxes: property.pricePerSF * 0.1,
    hoaFees: property.type === 'Office' ? 500 : 0,
    lotSize: property.sizeRange ? `${(property.sizeRange.max / 43560).toFixed(2)} AC / ${property.sizeRange.max.toLocaleString()} SF` : 'N/A',
    county: `${property.state} County`,
  };

  return propertyDetail;
}

