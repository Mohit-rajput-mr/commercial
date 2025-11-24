/**
 * Admin Panel LocalStorage Utilities
 * Handles all admin data storage and retrieval
 */

import type { AdminProperty, AdminUser, Chat, Activity, AdminSettings, AdminProfile } from '@/types/admin';

const STORAGE_KEYS = {
  AUTH: 'admin_authenticated',
  PROPERTIES: 'admin_properties',
  USERS: 'admin_users',
  CHATS: 'admin_chats',
  ACTIVITIES: 'admin_activities',
  SETTINGS: 'admin_settings',
  PROFILE: 'admin_profile',
};

// Authentication
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

export function setAdminAuthenticated(value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.AUTH, value ? 'true' : 'false');
}

// Properties
export function getAdminProperties(): AdminProperty[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
  return data ? JSON.parse(data) : [];
}

export function saveAdminProperties(properties: AdminProperty[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
}

export function addAdminProperty(property: AdminProperty): void {
  const properties = getAdminProperties();
  properties.push(property);
  saveAdminProperties(properties);
}

export function updateAdminProperty(id: string, updates: Partial<AdminProperty>): void {
  const properties = getAdminProperties();
  const index = properties.findIndex(p => p.id === id);
  if (index !== -1) {
    properties[index] = { ...properties[index], ...updates };
    saveAdminProperties(properties);
  }
}

export function deleteAdminProperty(id: string): void {
  const properties = getAdminProperties();
  const filtered = properties.filter(p => p.id !== id);
  saveAdminProperties(filtered);
}

// Users
export function getAdminUsers(): AdminUser[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function saveAdminUsers(users: AdminUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function updateAdminUser(id: string, updates: Partial<AdminUser>): void {
  const users = getAdminUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveAdminUsers(users);
  }
}

export function deleteAdminUser(id: string): void {
  const users = getAdminUsers();
  const filtered = users.filter(u => u.id !== id);
  saveAdminUsers(filtered);
}

// Chats
export function getAdminChats(): Chat[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CHATS);
  return data ? JSON.parse(data) : [];
}

export function saveAdminChats(chats: Chat[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
}

export function addChatMessage(chatId: string, message: Chat['messages'][0]): void {
  const chats = getAdminChats();
  const chat = chats.find(c => c.id === chatId);
  if (chat) {
    chat.messages.push(message);
    chat.lastMessageAt = message.timestamp;
    if (message.senderId !== 'admin') {
      chat.unreadCount += 1;
    }
    saveAdminChats(chats);
  }
}

export function markChatAsRead(chatId: string): void {
  const chats = getAdminChats();
  const chat = chats.find(c => c.id === chatId);
  if (chat) {
    chat.unreadCount = 0;
    chat.messages.forEach(m => m.read = true);
    saveAdminChats(chats);
  }
}

// Activities
export function getAdminActivities(): Activity[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  return data ? JSON.parse(data) : [];
}

export function addAdminActivity(activity: Activity): void {
  const activities = getAdminActivities();
  activities.unshift(activity); // Add to beginning
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.splice(100);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }
}

// Settings
export function getAdminSettings(): AdminSettings {
  if (typeof window === 'undefined') {
    return getDefaultSettings();
  }
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : getDefaultSettings();
}

export function saveAdminSettings(settings: AdminSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

function getDefaultSettings(): AdminSettings {
  return {
    siteTitle: 'Real Estate Marketplace',
    siteDescription: 'The World\'s #1 Commercial Real Estate Marketplace',
    contactEmail: 'leojoemail@gmail.com',
    contactPhone: '+1 (917) 209-6200',
    officeAddress: '',
    primaryColor: '#FFD700',
    secondaryColor: '#2D3748',
    propertiesPerPage: 20,
    defaultSortOrder: 'newest',
    enableUserRegistration: true,
    enableLiveChat: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
  };
}

// Profile
export function getAdminProfile(): AdminProfile {
  if (typeof window === 'undefined') {
    return { name: 'Admin', email: 'admin' };
  }
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : { name: 'Admin', email: 'admin' };
}

export function saveAdminProfile(profile: AdminProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

// Initialize mock data if not exists
export function initializeMockData(): void {
  if (typeof window === 'undefined') return;

  // Import mock data generators dynamically to avoid circular dependencies
  const {
    generateMockProperties,
    generateMockUsers,
    generateMockChats,
    generateMockActivities,
  } = require('./admin-mock-data');

  // Only initialize if data doesn't exist
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    const properties = generateMockProperties();
    saveAdminProperties(properties);
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const users = generateMockUsers();
    saveAdminUsers(users);
  }

  if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
    const chats = generateMockChats();
    saveAdminChats(chats);
  }

  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    const activities = generateMockActivities();
    activities.forEach((activity: Activity) => {
      addAdminActivity(activity);
    });
  }
}

