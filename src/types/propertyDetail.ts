import { Property, Agent, SpaceAvailability } from './property';

export interface PropertyDetail extends Property {
  // Extended fields for detail page
  title: string;
  subtitle: string;
  has3DTour: boolean;
  tourUrl?: string;
  
  // Additional images with types
  imageGallery: {
    url: string;
    alt: string;
    type: 'exterior' | 'interior' | 'amenity' | 'aerial';
  }[];
  
  // Transportation details
  transportation: {
    transit: {
      name: string;
      lines: string[];
      walkTime: string;
      distance: string;
    }[];
    commuterRail: {
      name: string;
      walkTime: string;
      distance: string;
    }[];
    airport: {
      name: string;
      driveTime: string;
      distance: string;
    };
  };
  
  // Nearby amenities
  nearbyAmenities: {
    restaurants: {
      name: string;
      cuisine: string;
      priceRange: string;
      distance: string;
    }[];
  };
  
  // Features and amenities list
  amenities: string[];
  
  // Owner/Management company
  owner: {
    name: string;
    logo: string;
    description: string;
    website: string;
  };
  
  // Related properties
  relatedProperties: string[]; // Array of property IDs
  
  // Metadata
  metadata: {
    listingId: string;
    dateOnMarket: string;
    lastUpdated: string;
  };
  
  // Map location
  location: {
    lat: number;
    lng: number;
    mapUrl: string;
  };
}

