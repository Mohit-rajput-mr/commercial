/**
 * IndexedDB Cache Utility for Property Data
 * Stores fetched properties in browser IndexedDB to avoid re-fetching
 */

const DB_NAME = 'PropertyCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'properties';

interface CacheEntry {
  key: string;
  data: any[];
  timestamp: number;
  metadata?: {
    location?: string;
    listingType?: string;
    filename?: string;
    propertyType?: 'residential' | 'commercial';
  };
}

// Initialize IndexedDB
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('propertyType', 'metadata.propertyType', { unique: false });
      }
    };
  });
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(
  type: 'residential' | 'commercial',
  params: {
    location?: string;
    listingType?: string;
    filename?: string;
  }
): string {
  if (type === 'residential') {
    return `residential_${params.location}_${params.listingType}`.toLowerCase().replace(/\s+/g, '_');
  } else {
    return `commercial_${params.filename}`.toLowerCase().replace(/\s+/g, '_');
  }
}

/**
 * Get cached properties from IndexedDB
 */
export async function getCachedProperties(cacheKey: string): Promise<any[] | null> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        const result = request.result as CacheEntry | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache is still valid (optional: 24 hour expiration)
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
        const isExpired = Date.now() - result.timestamp > CACHE_DURATION;
        
        if (isExpired) {
          console.log(`⚠️ Cache expired for key: ${cacheKey}`);
          // Delete expired entry
          deleteCachedProperties(cacheKey).catch(console.error);
          resolve(null);
          return;
        }

        console.log(`✅ Cache hit for key: ${cacheKey} (${result.data.length} properties)`);
        resolve(result.data);
      };

      request.onerror = () => {
        console.error('Error reading from IndexedDB:', request.error);
        resolve(null); // Return null on error, allow fallback to fetch
      };
    });
  } catch (error) {
    console.error('IndexedDB initialization error:', error);
    return null; // Return null on error, allow fallback to fetch
  }
}

/**
 * Save properties to IndexedDB cache
 */
export async function saveCachedProperties(
  cacheKey: string,
  properties: any[],
  metadata?: CacheEntry['metadata']
): Promise<void> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const entry: CacheEntry = {
        key: cacheKey,
        data: properties,
        timestamp: Date.now(),
        metadata,
      };

      const request = store.put(entry);

      request.onsuccess = () => {
        console.log(`💾 Cached ${properties.length} properties with key: ${cacheKey}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Error saving to IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB save error:', error);
    // Don't throw, caching is optional
  }
}

/**
 * Delete cached properties
 */
export async function deleteCachedProperties(cacheKey: string): Promise<void> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(cacheKey);

      request.onsuccess = () => {
        console.log(`🗑️ Deleted cache for key: ${cacheKey}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB delete error:', error);
  }
}

/**
 * Clear all cached properties
 */
export async function clearAllCache(): Promise<void> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Cleared all property cache');
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB clear error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{ count: number; totalSize: number }> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as CacheEntry[];
        const totalSize = JSON.stringify(entries).length;
        resolve({
          count: entries.length,
          totalSize,
        });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { count: 0, totalSize: 0 };
  }
}

