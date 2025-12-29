// IndexedDB utility for storing user preferences
const DB_NAME = 'UserPreferencesDB';
const DB_VERSION = 1;
const STORE_NAME = 'preferences';

interface UserPreferences {
  id: string;
  userId?: string;
  email?: string;
  propertyTypes?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  locations?: string[];
  notifications?: {
    email?: boolean;
    sms?: boolean;
    newProperties?: boolean;
    priceChanges?: boolean;
  };
  searchFilters?: {
    bedrooms?: number[];
    bathrooms?: number[];
    propertyType?: string[];
  };
  timestamp: number;
}

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export const initPreferencesDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open Preferences IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('userId', 'userId', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Save preferences
export const savePreferences = async (preferences: Omit<UserPreferences, 'id' | 'timestamp'>): Promise<void> => {
  const database = await initPreferencesDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Get current user
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id || 'anonymous' : 'anonymous';
    
    const preferenceData: UserPreferences = {
      ...preferences,
      id: `pref-${userId}-${Date.now()}`,
      userId,
      timestamp: Date.now(),
    };
    
    const request = store.put(preferenceData);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to save preferences'));
  });
};

// Get preferences
export const getPreferences = async (): Promise<UserPreferences | null> => {
  const database = await initPreferencesDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userId');
    
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id || 'anonymous' : 'anonymous';
    
    const request = index.getAll(userId);

    request.onsuccess = () => {
      const preferences = request.result;
      // Return most recent preferences
      if (preferences.length > 0) {
        const sorted = preferences.sort((a, b) => b.timestamp - a.timestamp);
        resolve(sorted[0]);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(new Error('Failed to get preferences'));
  });
};













