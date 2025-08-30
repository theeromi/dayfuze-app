// Offline notification storage using IndexedDB
export interface OfflineNotification {
  id: string;
  taskId: string;
  title: string;
  body?: string;
  dueTime: number; // timestamp
  scheduled: boolean;
  completed: boolean;
  createdAt: number;
}

class OfflineNotificationDB {
  private dbName = 'DayFuseNotifications';
  private version = 1;
  private storeName = 'notifications';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create notifications store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('taskId', 'taskId', { unique: false });
          store.createIndex('dueTime', 'dueTime', { unique: false });
          store.createIndex('scheduled', 'scheduled', { unique: false });
        }
      };
    });
  }

  async storeNotification(notification: OfflineNotification): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(notification);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getNotification(id: string): Promise<OfflineNotification | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllPendingNotifications(): Promise<OfflineNotification[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('scheduled');
      const request = index.getAll(IDBKeyRange.only(false)); // Get unscheduled notifications

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const notifications = request.result.filter(n => 
          !n.completed && n.dueTime > Date.now()
        );
        resolve(notifications);
      };
    });
  }

  async markAsScheduled(id: string): Promise<void> {
    if (!this.db) await this.init();

    const notification = await this.getNotification(id);
    if (notification) {
      notification.scheduled = true;
      await this.storeNotification(notification);
    }
  }

  async markAsCompleted(taskId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('taskId');
      const request = index.openCursor(IDBKeyRange.only(taskId));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const notification = cursor.value;
          notification.completed = true;
          cursor.update(notification);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  async deleteNotification(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteByTaskId(taskId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('taskId');
      const request = index.openKeyCursor(IDBKeyRange.only(taskId));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  async cleanupOldNotifications(): Promise<void> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('dueTime');
      const request = index.openKeyCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}

export const offlineNotificationDB = new OfflineNotificationDB();