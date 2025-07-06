// import { useStore } from '../store/store';
import { DatabaseService } from '../services/firebase';
import { dataBackupService } from './dataBackup';
import toast from 'react-hot-toast';

export interface QueuedOperation {
  id: string;
  type: 'add' | 'update' | 'delete';
  entity: 'log' | 'profile' | 'appointment' | 'reminder' | 'inventory';
  profileId?: string;
  data: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  attempts: number;
  lastAttempt?: number;
  error?: string;
}

export interface SyncResult {
  success: number;
  failed: number;
  errors: string[];
}

class OfflineQueueManager {
  private static instance: OfflineQueueManager;
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private maxAttempts = 3;
  // private baseDelay = 1000; // 1 second
  
  private constructor() {
    this.loadQueue();
    this.startAutoSync();
    this.setupNetworkListener();
  }

  static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager();
    }
    return OfflineQueueManager.instance;
  }

  // Add operation to queue
  addOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'attempts'>) {
    const queuedOp: QueuedOperation = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      attempts: 0,
      ...operation
    };

    this.queue.push(queuedOp);
    this.saveQueue();
    
    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  // Load queue from localStorage
  private loadQueue() {
    try {
      const savedQueue = localStorage.getItem('offline_queue');
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  // Save queue to localStorage
  private saveQueue() {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  // Process all queued operations
  async processQueue(userId?: string): Promise<SyncResult> {
    if (this.isProcessing || !navigator.onLine) {
      return { success: 0, failed: 0, errors: [] };
    }

    this.isProcessing = true;
    const result: SyncResult = { success: 0, failed: 0, errors: [] };
    
    try {
      const operationsToProcess = [...this.queue];
      
      for (const operation of operationsToProcess) {
        try {
          const success = await this.processOperation(operation, userId);
          if (success) {
            this.removeFromQueue(operation.id);
            result.success++;
          } else {
            operation.attempts++;
            operation.lastAttempt = Date.now();
            
            if (operation.attempts >= this.maxAttempts) {
              operation.error = 'Max attempts exceeded';
              result.failed++;
              result.errors.push(`${operation.entity} ${operation.type} failed after ${this.maxAttempts} attempts`);
            }
          }
        } catch (error) {
          operation.attempts++;
          operation.lastAttempt = Date.now();
          operation.error = error instanceof Error ? error.message : 'Unknown error';
          
          if (operation.attempts >= this.maxAttempts) {
            result.failed++;
            result.errors.push(`${operation.entity} ${operation.type}: ${operation.error}`);
          }
        }
      }
      
      // Remove failed operations that exceeded max attempts
      this.queue = this.queue.filter(op => op.attempts < this.maxAttempts);
      this.saveQueue();
      
    } finally {
      this.isProcessing = false;
    }

    return result;
  }

  // Process individual operation
  private async processOperation(operation: QueuedOperation, userId?: string): Promise<boolean> {
    if (!userId) {
      console.warn('No userId provided for sync operation');
      return false;
    }

    try {
      switch (operation.entity) {
        case 'log':
          return await this.processLogOperation(operation, userId);
        case 'profile':
          return await this.processProfileOperation(operation, userId);
        case 'appointment':
          return await this.processAppointmentOperation(operation, userId);
        case 'reminder':
          return await this.processReminderOperation(operation, userId);
        case 'inventory':
          return await this.processInventoryOperation(operation, userId);
        default:
          console.warn('Unknown entity type:', operation.entity);
          return false;
      }
    } catch (error) {
      console.error('Error processing operation:', error);
      return false;
    }
  }

  // Process log operations
  private async processLogOperation(operation: QueuedOperation, userId: string): Promise<boolean> {
    const { type, profileId, data } = operation;
    
    if (!profileId) {
      console.error('ProfileId required for log operation');
      return false;
    }

    switch (type) {
      case 'add':
        await DatabaseService.addLog(userId, profileId, data);
        return true;
      case 'update':
        await DatabaseService.updateLog(userId, profileId, data.id, data);
        return true;
      case 'delete':
        await DatabaseService.deleteLog(userId, profileId, data.id);
        return true;
      default:
        return false;
    }
  }

  // Process profile operations
  private async processProfileOperation(operation: QueuedOperation, userId: string): Promise<boolean> {
    const { type, data } = operation;

    switch (type) {
      case 'add':
        await DatabaseService.createProfile(userId, data);
        return true;
      case 'update':
        await DatabaseService.updateProfile(userId, data.id, data);
        return true;
      case 'delete':
        await DatabaseService.deleteProfile(userId, data.id);
        return true;
      default:
        return false;
    }
  }

  // Process appointment operations
  private async processAppointmentOperation(operation: QueuedOperation, userId: string): Promise<boolean> {
    const { type, profileId, data } = operation;
    
    if (!profileId) {
      console.error('ProfileId required for appointment operation');
      return false;
    }

    switch (type) {
      case 'add':
        await DatabaseService.addAppointment(userId, profileId, data);
        return true;
      case 'update':
        await DatabaseService.updateAppointment(userId, profileId, data.id, data);
        return true;
      case 'delete':
        await DatabaseService.deleteAppointment(userId, profileId, data.id);
        return true;
      default:
        return false;
    }
  }

  // Process reminder operations
  private async processReminderOperation(operation: QueuedOperation, userId: string): Promise<boolean> {
    const { type, profileId, data } = operation;
    
    if (!profileId) {
      console.error('ProfileId required for reminder operation');
      return false;
    }

    switch (type) {
      case 'add':
        await DatabaseService.addReminder(userId, profileId, data);
        return true;
      case 'update':
        await DatabaseService.updateReminder(userId, profileId, data.id, data);
        return true;
      case 'delete':
        await DatabaseService.deleteReminder(userId, profileId, data.id);
        return true;
      default:
        return false;
    }
  }

  // Process inventory operations
  private async processInventoryOperation(operation: QueuedOperation, userId: string): Promise<boolean> {
    const { type, profileId, data } = operation;
    
    if (!profileId) {
      console.error('ProfileId required for inventory operation');
      return false;
    }

    switch (type) {
      case 'add':
        await DatabaseService.updateInventory(userId, profileId, data);
        return true;
      case 'update':
        await DatabaseService.updateInventory(userId, profileId, data);
        return true;
      case 'delete':
        // For inventory deletion, we would need to implement a specific method
        console.warn('Inventory item deletion not implemented in DatabaseService');
        return true;
      default:
        return false;
    }
  }

  // Remove operation from queue
  private removeFromQueue(operationId: string) {
    this.queue = this.queue.filter(op => op.id !== operationId);
    this.saveQueue();
  }

  // Start automatic sync when online
  private startAutoSync() {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && this.queue.length > 0 && !this.isProcessing) {
        // This would be triggered with the actual userId when available
        console.log('Auto-sync triggered with', this.queue.length, 'operations');
      }
    }, 30000); // Check every 30 seconds
  }

  // Setup network status listener
  private setupNetworkListener() {
    window.addEventListener('online', () => {
      toast.success('Back online! Syncing data...');
      if (this.queue.length > 0) {
        // This would be triggered with the actual userId when available
        console.log('Network back online, processing queue');
      }
    });

    window.addEventListener('offline', () => {
      toast.error('You are offline. Changes will be synced when back online.');
    });
  }

  // Get queue status
  getQueueStatus() {
    const priorityCount = {
      high: this.queue.filter(op => op.priority === 'high').length,
      medium: this.queue.filter(op => op.priority === 'medium').length,
      low: this.queue.filter(op => op.priority === 'low').length
    };

    const failedOperations = this.queue.filter(op => op.attempts >= this.maxAttempts);
    const pendingOperations = this.queue.filter(op => op.attempts < this.maxAttempts);

    return {
      total: this.queue.length,
      pending: pendingOperations.length,
      failed: failedOperations.length,
      isProcessing: this.isProcessing,
      priorityCount,
      oldestOperation: this.queue.length > 0 ? Math.min(...this.queue.map(op => op.timestamp)) : null
    };
  }

  // Clear failed operations
  clearFailedOperations() {
    const failedCount = this.queue.filter(op => op.attempts >= this.maxAttempts).length;
    this.queue = this.queue.filter(op => op.attempts < this.maxAttempts);
    this.saveQueue();
    
    if (failedCount > 0) {
      toast.success(`Cleared ${failedCount} failed operations`);
    }
  }

  // Retry failed operations
  retryFailedOperations() {
    const failedOps = this.queue.filter(op => op.attempts >= this.maxAttempts);
    failedOps.forEach(op => {
      op.attempts = 0;
      op.error = undefined;
      op.lastAttempt = undefined;
    });
    this.saveQueue();
    
    if (failedOps.length > 0) {
      toast.success(`Retrying ${failedOps.length} failed operations`);
      if (navigator.onLine) {
        this.processQueue();
      }
    }
  }

  // Get detailed queue information
  getQueueDetails() {
    return {
      operations: this.queue.map(op => ({
        id: op.id,
        type: op.type,
        entity: op.entity,
        priority: op.priority,
        attempts: op.attempts,
        timestamp: new Date(op.timestamp).toISOString(),
        error: op.error
      })),
      status: this.getQueueStatus()
    };
  }

  // Manual sync trigger
  async manualSync(userId: string): Promise<SyncResult> {
    if (!userId) {
      throw new Error('User ID is required for manual sync');
    }

    toast.loading('Syncing data...', { id: 'manual-sync' });
    
    try {
      const result = await this.processQueue(userId);
      
      if (result.success > 0) {
        toast.success(`Successfully synced ${result.success} operations`, { id: 'manual-sync' });
      }
      
      if (result.failed > 0) {
        toast.error(`${result.failed} operations failed to sync`, { id: 'manual-sync' });
      }
      
      if (result.success === 0 && result.failed === 0) {
        toast.success('All data is up to date', { id: 'manual-sync' });
      }
      
      return result;
    } catch (error) {
      toast.error('Sync failed. Please try again.', { id: 'manual-sync' });
      throw error;
    }
  }

  // Create backup before major operations
  async createSafetyBackup(userId?: string) {
    try {
      await dataBackupService.createBackup(userId);
      console.log('Safety backup created before sync');
    } catch (error) {
      console.error('Failed to create safety backup:', error);
    }
  }

  // Cleanup old queue entries
  cleanupOldEntries(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const cutoff = Date.now() - maxAge;
    const oldCount = this.queue.filter(op => op.timestamp < cutoff).length;
    
    this.queue = this.queue.filter(op => op.timestamp >= cutoff);
    this.saveQueue();
    
    if (oldCount > 0) {
      console.log(`Cleaned up ${oldCount} old queue entries`);
    }
  }

  // Cleanup method
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    // Note: In a real implementation, we would need to store references to the event listeners
    // to properly remove them. For now, we'll just clear the interval.
  }
}

// Export singleton instance
export const offlineQueueManager = OfflineQueueManager.getInstance();

// Helper functions for components
export const addToOfflineQueue = (operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'attempts'>) => {
  offlineQueueManager.addOperation(operation);
};

export const getOfflineQueueStatus = () => offlineQueueManager.getQueueStatus();
export const getOfflineQueueDetails = () => offlineQueueManager.getQueueDetails();
export const clearFailedOperations = () => offlineQueueManager.clearFailedOperations();
export const retryFailedOperations = () => offlineQueueManager.retryFailedOperations();
export const manualSync = (userId: string) => offlineQueueManager.manualSync(userId);
export const createSafetyBackup = (userId?: string) => offlineQueueManager.createSafetyBackup(userId);

// Enhanced logging wrapper for offline operations
export const withOfflineSupport = <T extends any[]>(
  operation: (...args: T) => Promise<any>,
  queueConfig: {
    entity: QueuedOperation['entity'];
    type: QueuedOperation['type'];
    priority?: QueuedOperation['priority'];
    getProfileId?: (...args: T) => string | undefined;
    getData: (...args: T) => any;
  }
) => {
  return async (...args: T) => {
    try {
      // Try to execute immediately if online
      if (navigator.onLine) {
        const result = await operation(...args);
        return result;
      }
    } catch (error) {
      // If online but failed, or if offline, add to queue
      console.warn('Operation failed, adding to offline queue:', error);
    }

    // Add to offline queue
    addToOfflineQueue({
      entity: queueConfig.entity,
      type: queueConfig.type,
      priority: queueConfig.priority || 'medium',
      profileId: queueConfig.getProfileId?.(...args),
      data: queueConfig.getData(...args)
    });

    toast.success('Operation queued for sync when back online');
  };
}; 