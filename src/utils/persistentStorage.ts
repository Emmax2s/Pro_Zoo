const DB_NAME = 'pro-zoo-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';

const hasIndexedDb = () => typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB no disponible'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error ?? new Error('No se pudo abrir IndexedDB'));
    };
  });
};

export const idbGetItem = async <T>(key: string): Promise<T | null> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve((request.result as T | undefined) ?? null);
    };

    request.onerror = () => {
      reject(request.error ?? new Error('No se pudo leer de IndexedDB'));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
};

export const idbSetItem = async <T>(key: string, value: T): Promise<void> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onerror = () => {
      reject(request.error ?? new Error('No se pudo guardar en IndexedDB'));
    };

    tx.oncomplete = () => {
      db.close();
      resolve();
    };

    tx.onerror = () => {
      reject(tx.error ?? new Error('Transaccion fallida en IndexedDB'));
    };
  });
};
