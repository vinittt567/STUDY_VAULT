class FileStorageManager {
  private static instance: FileStorageManager;
  private dbName = 'StudyVaultDB';
  private storeName = 'files';
  private dbVersion = 1;

  private constructor() {}

  static getInstance(): FileStorageManager {
    if (!FileStorageManager.instance) {
      FileStorageManager.instance = new FileStorageManager();
    }
    return FileStorageManager.instance;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('filename', 'filename', { unique: false });
        }
      };
    });
  }

  async storeFile(file: File): Promise<string> {
    try {
      console.log('📤 Storing file in IndexedDB:', file.name, 'Size:', this.formatFileSize(file.size));
      
      const fileId = `uploaded_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const db = await this.openDB();
      
      // Convert file to ArrayBuffer for efficient storage
      const arrayBuffer = await file.arrayBuffer();
      
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const fileData = {
        id: fileId,
        filename: file.name,
        type: file.type,
        size: file.size,
        data: arrayBuffer,
        uploadedAt: new Date().toISOString()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.add(fileData);
        
        request.onsuccess = () => {
          console.log('✅ File stored successfully in IndexedDB:', fileId);
          resolve(fileId);
        };
        
        request.onerror = () => {
          console.error('❌ Failed to store file in IndexedDB:', request.error);
          reject(new Error('Failed to store file in IndexedDB'));
        };
      });
      
    } catch (error) {
      console.error('❌ Error storing file:', error);
      throw new Error('Failed to store file');
    }
  }

  async getFileUrl(fileId: string): Promise<string> {
    try {
      console.log('📖 Retrieving file from IndexedDB:', fileId);
      
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(fileId);
        
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Create a Blob from the stored ArrayBuffer
            const blob = new Blob([result.data], { type: result.type });
            // Create an object URL for the PDF viewer
            const objectUrl = URL.createObjectURL(blob);
            console.log('✅ File retrieved and object URL created:', fileId);
            resolve(objectUrl);
          } else {
            console.warn('⚠️ File not found in IndexedDB:', fileId);
            resolve('');
          }
        };
        
        request.onerror = () => {
          console.error('❌ Failed to retrieve file from IndexedDB:', request.error);
          reject(new Error('Failed to retrieve file'));
        };
      });
      
    } catch (error) {
      console.error('❌ Error retrieving file:', error);
      return '';
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting file from IndexedDB:', fileId);
      
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(fileId);
        
        request.onsuccess = () => {
          console.log('✅ File deleted from IndexedDB:', fileId);
          resolve();
        };
        
        request.onerror = () => {
          console.error('❌ Failed to delete file from IndexedDB:', request.error);
          reject(new Error('Failed to delete file'));
        };
      });
      
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }
  }

  async listFiles(): Promise<Array<{ id: string; filename: string; size: number; uploadedAt: string }>> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result.map(file => ({
            id: file.id,
            filename: file.filename,
            size: file.size,
            uploadedAt: file.uploadedAt
          }));
          resolve(files);
        };
        
        request.onerror = () => {
          console.error('❌ Failed to list files from IndexedDB:', request.error);
          reject(new Error('Failed to list files'));
        };
      });
      
    } catch (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileStorage = FileStorageManager.getInstance();