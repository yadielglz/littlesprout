import { useStore } from '../store/store';
import { DatabaseService } from '../services/firebase';
import toast from 'react-hot-toast';

export interface BackupData {
  timestamp: string;
  version: string;
  data: {
    profiles: any[];
    logs: Record<string, any[]>;
    inventories: Record<string, any>;
    reminders: Record<string, any[]>;
    appointments: Record<string, any[]>;
    customActivities: any[];
    achievedMilestones: Record<string, any[]>;
    settings: {
      isDarkMode: boolean;
      temperatureUnit: 'C' | 'F';
      measurementUnit: 'oz' | 'ml';
    };
  };
}

export interface SyncCheckpoint {
  id: string;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
  dataHash: string;
  changes: {
    profiles: number;
    logs: number;
    other: number;
  };
}

class DataBackupService {
  private static instance: DataBackupService;
  private syncQueue: Array<{ action: string; data: any; timestamp: string }> = [];
  private lastSyncTime: number = 0;
  private syncInterval: NodeJS.Timeout | null = null;
  private checkpointInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadSyncQueue();
    this.startPeriodicSync();
    this.startCheckpointCreation();
  }

  static getInstance(): DataBackupService {
    if (!DataBackupService.instance) {
      DataBackupService.instance = new DataBackupService();
    }
    return DataBackupService.instance;
  }

  // Create a complete backup of all data
  async createBackup(userId?: string): Promise<BackupData> {
    const state = useStore.getState();
    
    const backup: BackupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        profiles: state.profiles,
        logs: state.logs,
        inventories: state.inventories,
        reminders: state.reminders,
        appointments: state.appointments,
        customActivities: state.customActivities,
        achievedMilestones: state.achievedMilestones,
        settings: {
          isDarkMode: state.isDarkMode,
          temperatureUnit: state.temperatureUnit,
          measurementUnit: state.measurementUnit
        }
      }
    };

    // Store backup locally
    this.saveBackupLocally(backup);
    
    // Store backup in Firebase if user is logged in
    if (userId) {
      try {
        await this.saveBackupToFirebase(userId, backup);
      } catch (error) {
        console.warn('Failed to save backup to Firebase:', error);
      }
    }

    return backup;
  }

  // Save backup to localStorage
  private saveBackupLocally(backup: BackupData) {
    try {
      const backupKey = `backup_${backup.timestamp}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));
      
      // Keep only the last 5 backups
      this.cleanupOldBackups();
      
      // Update latest backup reference
      localStorage.setItem('latest_backup', backupKey);
    } catch (error) {
      console.error('Failed to save backup locally:', error);
    }
  }

  // Save backup to Firebase
  private async saveBackupToFirebase(userId: string, backup: BackupData) {
    try {
      await DatabaseService.saveBackup(userId, backup);
    } catch (error) {
      console.error('Failed to save backup to Firebase:', error);
      throw error;
    }
  }

  // Clean up old local backups
  private cleanupOldBackups() {
    try {
      const backupKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('backup_')) {
          backupKeys.push(key);
        }
      }
      
      // Sort by timestamp and remove older ones
      backupKeys.sort((a, b) => {
        const timestampA = a.split('_')[1];
        const timestampB = b.split('_')[1];
        return timestampB.localeCompare(timestampA);
      });
      
      // Keep only the 5 most recent backups
      backupKeys.slice(5).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  // Restore from backup
  async restoreFromBackup(backup: BackupData): Promise<void> {
    try {
      const { data } = backup;
      
      // Restore state
      useStore.setState({
        profiles: data.profiles || [],
        logs: data.logs || {},
        inventories: data.inventories || {},
        reminders: data.reminders || {},
        appointments: data.appointments || {},
        customActivities: data.customActivities || [],
        achievedMilestones: data.achievedMilestones || {},
        isDarkMode: data.settings?.isDarkMode ?? false,
        temperatureUnit: data.settings?.temperatureUnit ?? 'F',
        measurementUnit: data.settings?.measurementUnit ?? 'oz'
      });

      toast.success('Data restored successfully!');
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      toast.error('Failed to restore data. Please try again.');
      throw error;
    }
  }

  // Get list of available backups
  getLocalBackups(): BackupData[] {
    const backups: BackupData[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('backup_')) {
          const backupData = localStorage.getItem(key);
          if (backupData) {
            backups.push(JSON.parse(backupData));
          }
        }
      }
      return backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get local backups:', error);
      return [];
    }
  }

  // Export data as JSON file
  exportData(): string {
    const state = useStore.getState();
    const exportData = {
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      profiles: state.profiles,
      logs: state.logs,
      inventories: state.inventories,
      reminders: state.reminders,
      appointments: state.appointments,
      customActivities: state.customActivities,
      achievedMilestones: state.achievedMilestones,
      settings: {
        isDarkMode: state.isDarkMode,
        temperatureUnit: state.temperatureUnit,
        measurementUnit: state.measurementUnit
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import data from JSON
  async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      // Validate import data structure
      if (!this.validateImportData(importData)) {
        throw new Error('Invalid import data format');
      }

      // Create backup before importing
      await this.createBackup();
      
      // Import data
      useStore.setState({
        profiles: importData.profiles || [],
        logs: importData.logs || {},
        inventories: importData.inventories || {},
        reminders: importData.reminders || {},
        appointments: importData.appointments || {},
        customActivities: importData.customActivities || [],
        achievedMilestones: importData.achievedMilestones || {},
        isDarkMode: importData.settings?.isDarkMode ?? useStore.getState().isDarkMode,
        temperatureUnit: importData.settings?.temperatureUnit ?? useStore.getState().temperatureUnit,
        measurementUnit: importData.settings?.measurementUnit ?? useStore.getState().measurementUnit
      });

      toast.success('Data imported successfully!');
    } catch (error) {
      console.error('Failed to import data:', error);
      toast.error('Failed to import data. Please check the file format.');
      throw error;
    }
  }

  // Validate import data structure
  private validateImportData(data: any): boolean {
    const requiredFields = ['profiles', 'logs'];
    return requiredFields.every(field => field in data);
  }

  // Add item to sync queue
  addToSyncQueue(action: string, data: any) {
    this.syncQueue.push({
      action,
      data,
      timestamp: new Date().toISOString()
    });
    this.saveSyncQueue();
  }

  // Save sync queue to localStorage
  private saveSyncQueue() {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Load sync queue from localStorage
  private loadSyncQueue() {
    try {
      const queueData = localStorage.getItem('sync_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Process sync queue
  async processSyncQueue(userId: string) {
    if (this.syncQueue.length === 0) return;

    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];
    this.saveSyncQueue();

    try {
      for (const item of itemsToSync) {
        await this.processSyncItem(userId, item);
      }
      
      this.lastSyncTime = Date.now();
      toast.success(`Synced ${itemsToSync.length} items to cloud`);
    } catch (error) {
      // Re-add failed items to queue
      this.syncQueue.unshift(...itemsToSync);
      this.saveSyncQueue();
      console.error('Failed to process sync queue:', error);
    }
  }

  // Process individual sync item
  private async processSyncItem(userId: string, item: { action: string; data: any; timestamp: string }) {
    // This would implement the actual sync logic based on the action type
    // For now, it's a placeholder
    console.log('Processing sync item:', item);
  }

  // Start periodic sync
  private startPeriodicSync() {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && this.syncQueue.length > 0) {
        // This would trigger sync if user is authenticated
        // For now, it's a placeholder
        console.log('Periodic sync triggered');
      }
    }, 5 * 60 * 1000);
  }

  // Create periodic checkpoints
  private startCheckpointCreation() {
    // Create checkpoint every 30 minutes
    this.checkpointInterval = setInterval(() => {
      this.createCheckpoint();
    }, 30 * 60 * 1000);
  }

  // Create a data checkpoint
  private createCheckpoint() {
    try {
      const state = useStore.getState();
      const checkpoint: SyncCheckpoint = {
        id: `checkpoint_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'pending',
        dataHash: this.generateDataHash(state),
        changes: {
          profiles: state.profiles.length,
          logs: Object.values(state.logs).flat().length,
          other: Object.keys(state.reminders).length + Object.keys(state.appointments).length
        }
      };

      // Save checkpoint locally
      localStorage.setItem(checkpoint.id, JSON.stringify(checkpoint));
      
      // Clean up old checkpoints
      this.cleanupOldCheckpoints();
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
    }
  }

  // Generate a simple hash for data comparison
  private generateDataHash(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Clean up old checkpoints
  private cleanupOldCheckpoints() {
    try {
      const checkpointKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('checkpoint_')) {
          checkpointKeys.push(key);
        }
      }
      
      // Keep only the last 10 checkpoints
      checkpointKeys.sort((a, b) => {
        const timestampA = parseInt(a.split('_')[1]);
        const timestampB = parseInt(b.split('_')[1]);
        return timestampB - timestampA;
      });
      
      checkpointKeys.slice(10).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to cleanup old checkpoints:', error);
    }
  }

  // Get recovery information
  getRecoveryInfo() {
    return {
      lastSyncTime: this.lastSyncTime,
      queuedItems: this.syncQueue.length,
      backupCount: this.getLocalBackups().length,
      isOnline: navigator.onLine
    };
  }

  // Cleanup method
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.checkpointInterval) {
      clearInterval(this.checkpointInterval);
    }
  }
}

// Export singleton instance
export const dataBackupService = DataBackupService.getInstance();

// Utility functions for components
export const createDataBackup = (userId?: string) => dataBackupService.createBackup(userId);
export const restoreFromBackup = (backup: BackupData) => dataBackupService.restoreFromBackup(backup);
export const exportAppData = () => dataBackupService.exportData();
export const importAppData = (jsonData: string) => dataBackupService.importData(jsonData);
export const getLocalBackups = () => dataBackupService.getLocalBackups();
export const getRecoveryInfo = () => dataBackupService.getRecoveryInfo(); 