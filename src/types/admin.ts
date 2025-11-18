// Admin Panel Types

export interface AdminProperty {
  id: string;
  zpid: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number | 'Price on Request';
  status: 'For Lease' | 'For Sale' | 'Auctions' | 'Businesses For Sale' | 'LandForAuction';
  type: 'Office' | 'Retail' | 'Industrial' | 'Flex' | 'Coworking' | 'Medical' | 'Land' | 'Condo' | 'House';
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  description: string;
  features: string[];
  images: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  listedDate: string;
  views: number;
  inquiries: number;
  latitude?: number;
  longitude?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredDate: string;
  lastLogin: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  totalInquiries: number;
  activityLog: Activity[];
}

export interface Activity {
  id: string;
  type: 'property_added' | 'property_updated' | 'property_deleted' | 'user_inquiry' | 'user_registered' | 'settings_updated';
  description: string;
  timestamp: string;
  userId?: string;
  propertyId?: string;
}

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  propertyId: string;
  propertyAddress: string;
  messages: ChatMessage[];
  status: 'Active' | 'Resolved' | 'Archived';
  unreadCount: number;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'admin' or userId
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface AdminSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  primaryColor: string;
  secondaryColor: string;
  propertiesPerPage: number;
  defaultSortOrder: string;
  enableUserRegistration: boolean;
  enableLiveChat: boolean;
  enableEmailNotifications: boolean;
  maintenanceMode: boolean;
}

export interface AdminProfile {
  name: string;
  email: string;
  photo?: string;
}


