// IndexedDB utility for storing favorites
const DB_NAME = 'PropertyFavoritesDB';
const DB_VERSION = 1;
const STORE_NAME = 'favorites';

export interface FavoriteProperty {
  id: string;
  propertyId: string;
  address?: string;
  price?: string;
  propertyType?: string;
  imageUrl?: string;
  city?: string;
  state?: string;
  dataSource?: 'commercial' | 'residential';
  rawData?: any;
  timestamp: number;
}

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('propertyId', 'propertyId', { unique: true });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Add favorite
export const addFavorite = async (property: FavoriteProperty): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const favorite: FavoriteProperty = {
      ...property,
      timestamp: Date.now(),
    };
    const request = store.put(favorite);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to add favorite'));
  });
};

// Remove favorite
export const removeFavorite = async (propertyId: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('propertyId');
    const request = index.get(propertyId);

    request.onsuccess = () => {
      const favorite = request.result;
      if (favorite) {
        const deleteRequest = store.delete(favorite.id);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(new Error('Failed to remove favorite'));
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(new Error('Failed to find favorite'));
  });
};

// Check if favorite exists
export const isFavorite = async (propertyId: string): Promise<boolean> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('propertyId');
    const request = index.get(propertyId);

    request.onsuccess = () => {
      resolve(!!request.result);
    };
    request.onerror = () => reject(new Error('Failed to check favorite'));
  });
};

// Get all favorites
export const getAllFavorites = async (): Promise<FavoriteProperty[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => {
      // Sort by timestamp descending (newest first)
      const favorites = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(favorites);
    };
    request.onerror = () => reject(new Error('Failed to get favorites'));
  });
};

// Clear all favorites
export const clearAllFavorites = async (): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear favorites'));
  });
};

