const DB_NAME = 'SecureChatDB';
const STORE_NAME = 'KeyStore';
const DB_VERSION = 1;

export class KeyStorageService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !indexedDB) {
      throw new Error('IndexedDB is not supported in this browser.');
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    const transaction = db.transaction(STORE_NAME, mode);
    return transaction.objectStore(STORE_NAME);
  }

  async saveMySecretKey(secretKey: Uint8Array): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(secretKey, 'master_key');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMySecretKey(): Promise<Uint8Array | null> {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get('master_key');
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? (result as Uint8Array) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSharedKey(friendId: string, sharedKey: Uint8Array): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(sharedKey, `shared_key_${friendId}`);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSharedKey(friendId: string): Promise<Uint8Array | null> {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(`shared_key_${friendId}`);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? (result as Uint8Array) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const keyStorage = new KeyStorageService();
