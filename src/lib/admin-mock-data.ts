/**
 * Mock Data Generator for Admin Panel
 * Generates realistic sample data for testing
 */

import type { AdminProperty, AdminUser, Chat, Activity } from '@/types/admin';

export function generateMockProperties(): AdminProperty[] {
  return [
    {
      id: '1',
      zpid: '25.788544--80.21954',
      address: '1444 NW 14th Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33125',
      price: 'Price on Request',
      status: 'For Lease',
      type: 'Office',
      beds: undefined,
      baths: undefined,
      sqft: 2500,
      yearBuilt: 1995,
      description: 'Prime office space in the heart of Miami. Modern amenities and excellent location.',
      features: ['Parking Available', 'Air Conditioning', 'High Ceilings', 'Modern Renovation'],
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
      ],
      contactName: 'Leo Jo',
      contactEmail: 'leojoemall@gmail.com',
      contactPhone: '+1 (917) 209-6200',
      listedDate: '2025-01-10T10:00:00Z',
      views: 245,
      inquiries: 12,
      latitude: 25.788544,
      longitude: -80.21954,
    },
    {
      id: '2',
      zpid: '25.73281--80.30778',
      address: '7004 SW 40th St',
      city: 'Miami',
      state: 'FL',
      zip: '33155',
      price: 'Price on Request',
      status: 'For Lease',
      type: 'Retail',
      beds: undefined,
      baths: undefined,
      sqft: 1800,
      yearBuilt: 2000,
      description: 'Excellent retail space with high foot traffic. Perfect for retail business.',
      features: ['High Visibility', 'Parking', 'Storefront', 'Good Location'],
      images: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
      ],
      contactName: 'Leo Jo',
      contactEmail: 'leojoemall@gmail.com',
      contactPhone: '+1 (917) 209-6200',
      listedDate: '2025-01-12T14:30:00Z',
      views: 189,
      inquiries: 8,
      latitude: 25.73281,
      longitude: -80.30778,
    },
    {
      id: '3',
      zpid: '25.772842--80.25521',
      address: '61 NW 37th Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33125',
      price: 'Price on Request',
      status: 'For Lease',
      type: 'Industrial',
      beds: undefined,
      baths: undefined,
      sqft: 5000,
      yearBuilt: 1985,
      description: 'Large industrial warehouse space. Ideal for manufacturing or storage.',
      features: ['Loading Dock', 'High Ceilings', 'Heavy Power', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
      ],
      contactName: 'Leo Jo',
      contactEmail: 'leojoemall@gmail.com',
      contactPhone: '+1 (917) 209-6200',
      listedDate: '2025-01-08T09:15:00Z',
      views: 312,
      inquiries: 15,
      latitude: 25.772842,
      longitude: -80.25521,
    },
    {
      id: '4',
      zpid: '2083228732',
      address: '123 Ocean Drive',
      city: 'Miami Beach',
      state: 'FL',
      zip: '33139',
      price: 850000,
      status: 'For Sale',
      type: 'Condo',
      beds: 1,
      baths: 2,
      sqft: 975,
      yearBuilt: 2010,
      description: 'Beautiful oceanfront condo with stunning views. Modern amenities and beach access.',
      features: ['Ocean View', 'Beach Access', 'Pool', 'Gym', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
      ],
      contactName: 'Leo Jo',
      contactEmail: 'leojoemall@gmail.com',
      contactPhone: '+1 (917) 209-6200',
      listedDate: '2025-01-15T11:20:00Z',
      views: 567,
      inquiries: 23,
      latitude: 25.790654,
      longitude: -80.130045,
    },
    {
      id: '5',
      zpid: '37743732',
      address: '5000 SW 72nd Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33155',
      price: 100000,
      status: 'LandForAuction',
      type: 'Land',
      beds: undefined,
      baths: undefined,
      sqft: 10000,
      yearBuilt: undefined,
      description: 'Prime development land. Zoned for commercial use. Great investment opportunity.',
      features: ['Commercial Zoning', 'Corner Lot', 'Highway Access'],
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
      ],
      contactName: 'Leo Jo',
      contactEmail: 'leojoemall@gmail.com',
      contactPhone: '+1 (917) 209-6200',
      listedDate: '2025-01-05T08:00:00Z',
      views: 423,
      inquiries: 18,
      latitude: 25.723456,
      longitude: -80.312345,
    },
    // Add 25+ more properties
    ...Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 6),
      zpid: `${Math.floor(Math.random() * 1000000000)}`,
      address: `${Math.floor(Math.random() * 9999)} ${['NW', 'NE', 'SW', 'SE'][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 200)}th St`,
      city: ['Miami', 'Miami Beach', 'Coral Gables', 'Aventura', 'Doral'][Math.floor(Math.random() * 5)],
      state: 'FL',
      zip: `331${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
      price: Math.random() > 0.3 ? Math.floor(Math.random() * 2000000) + 100000 : 'Price on Request' as const,
      status: ['For Lease', 'For Sale', 'Auctions', 'Businesses For Sale', 'LandForAuction'][Math.floor(Math.random() * 5)] as AdminProperty['status'],
      type: ['Office', 'Retail', 'Industrial', 'Flex', 'Coworking', 'Medical', 'Land', 'Condo', 'House'][Math.floor(Math.random() * 9)] as AdminProperty['type'],
      beds: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : undefined,
      baths: Math.random() > 0.5 ? Math.floor(Math.random() * 4) + 1 : undefined,
      sqft: Math.floor(Math.random() * 5000) + 500,
      yearBuilt: Math.floor(Math.random() * 50) + 1970,
      description: 'Excellent property in prime location with modern amenities.',
      features: ['Parking', 'Modern', 'Prime Location'],
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
      ],
      contactName: 'Leo Jo',
      contactEmail: 'leojoemall@gmail.com',
      contactPhone: '+1 (917) 209-6200',
      listedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      views: Math.floor(Math.random() * 1000),
      inquiries: Math.floor(Math.random() * 50),
      latitude: 25.7 + Math.random() * 0.2,
      longitude: -80.3 + Math.random() * 0.2,
    })),
  ];
}

export function generateMockUsers(): AdminUser[] {
  const names = [
    'John Doe', 'Jane Smith', 'Mike Rodriguez', 'Sarah Johnson', 'David Lee',
    'Emily Chen', 'Robert Wilson', 'Lisa Anderson', 'James Brown', 'Maria Garcia',
    'William Taylor', 'Jennifer Martinez', 'Christopher Davis', 'Jessica Miller',
    'Daniel Moore', 'Ashley Jackson', 'Matthew White', 'Amanda Harris', 'Joshua Martin',
    'Stephanie Thompson', 'Andrew Garcia', 'Nicole Martinez', 'Kevin Robinson',
    'Michelle Clark', 'Ryan Lewis', 'Lauren Walker', 'Brandon Hall', 'Rachel Allen',
    'Justin Young', 'Samantha King', 'Tyler Wright', 'Brittany Lopez', 'Jordan Hill',
    'Megan Scott', 'Austin Green', 'Kayla Adams', 'Connor Baker', 'Olivia Nelson',
    'Ethan Carter', 'Hannah Mitchell', 'Noah Perez', 'Sophia Roberts', 'Lucas Turner',
    'Isabella Phillips', 'Aiden Campbell', 'Emma Parker', 'Liam Evans', 'Ava Edwards',
    'Mason Collins', 'Charlotte Stewart', 'Logan Sanchez', 'Harper Morris',
  ];

  return names.map((name, index) => {
    const email = name.toLowerCase().replace(' ', '') + '@email.com';
    const registeredDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
    const lastLogin = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    return {
      id: `user-${index + 1}`,
      name,
      email,
      phone: `305-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      registeredDate,
      lastLogin,
      status: Math.random() > 0.1 ? 'Active' : (Math.random() > 0.5 ? 'Inactive' : 'Blocked') as AdminUser['status'],
      totalInquiries: Math.floor(Math.random() * 20),
      activityLog: [],
    };
  });
}

export function generateMockChats(): Chat[] {
  const users = generateMockUsers().slice(0, 10);
  const properties = generateMockProperties().slice(0, 10);

  return users.map((user, index) => {
    const property = properties[index];
    const messages: Chat['messages'] = [
      {
        id: `msg-${index}-1`,
        senderId: user.id,
        senderName: user.name,
        text: index === 0 
          ? "Hi, I'm interested in this property. Is it still available?"
          : index === 1
          ? "What's the square footage?"
          : "Can I schedule a viewing?",
        timestamp: new Date(Date.now() - (index * 2 + 1) * 60 * 60 * 1000).toISOString(),
        read: index > 2,
      },
      {
        id: `msg-${index}-2`,
        senderId: 'admin',
        senderName: 'Admin',
        text: index === 0
          ? "Hello! Yes, this property is still available. Would you like to schedule a viewing?"
          : index === 1
          ? "This property is 975 sqft."
          : "Absolutely! What time works best for you?",
        timestamp: new Date(Date.now() - (index * 2) * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ];

    if (index === 0) {
      messages.push({
        id: `msg-${index}-3`,
        senderId: user.id,
        senderName: user.name,
        text: "Yes, I'd love to! Are there any times available this week?",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
      });
    }

    return {
      id: `chat-${index + 1}`,
      userId: user.id,
      userName: user.name,
      propertyId: property.id,
      propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
      messages,
      status: index < 3 ? 'Active' : (index < 7 ? 'Resolved' : 'Archived') as Chat['status'],
      unreadCount: index === 0 ? 1 : 0,
      lastMessageAt: messages[messages.length - 1].timestamp,
    };
  });
}

export function generateMockActivities(): Activity[] {
  const properties = generateMockProperties();
  const users = generateMockUsers();

  const activities: Activity[] = [
    {
      id: 'act-1',
      type: 'property_added',
      description: `New property added: ${properties[0].address}, ${properties[0].city}, ${properties[0].state}`,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      propertyId: properties[0].id,
    },
    {
      id: 'act-2',
      type: 'user_inquiry',
      description: `User ${users[0].name} inquired about property #${properties[0].zpid}`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      userId: users[0].id,
      propertyId: properties[0].id,
    },
    {
      id: 'act-3',
      type: 'property_updated',
      description: `Property #${properties[4].zpid} status changed to LandForAuction`,
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      propertyId: properties[4].id,
    },
    {
      id: 'act-4',
      type: 'settings_updated',
      description: 'Admin updated site settings',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-5',
      type: 'user_registered',
      description: `New user registered: ${users[5].name}`,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      userId: users[5].id,
    },
  ];

  // Add more activities
  for (let i = 0; i < 5; i++) {
    const prop = properties[Math.floor(Math.random() * properties.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    activities.push({
      id: `act-${i + 6}`,
      type: ['property_added', 'property_updated', 'user_inquiry'][Math.floor(Math.random() * 3)] as Activity['type'],
      description: `Activity ${i + 6}`,
      timestamp: new Date(Date.now() - (i + 6) * 60 * 60 * 1000).toISOString(),
      propertyId: prop.id,
      userId: user.id,
    });
  }

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Note: initializeMockData() is now exported from admin-storage.ts
// This ensures proper separation of concerns and avoids circular dependencies

