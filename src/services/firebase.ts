import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BabyProfile, LogEntry, Inventory, Reminder, Appointment } from '../store/store';

const PROFILES_COLLECTION = 'profiles';

// Database Service for Firestore operations
export class DatabaseService {
  // Baby Profiles
  static async createProfile(userId: string, profile: BabyProfile) {
    const profileRef = doc(db, 'users', userId, 'profiles', profile.id);
    await setDoc(profileRef, {
      ...profile,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static async getProfiles(userId: string): Promise<BabyProfile[]> {
    const profilesRef = collection(db, 'users', userId, 'profiles');
    const snapshot = await getDocs(profilesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BabyProfile));
  }

  static async updateProfile(userId: string, profileId: string, updates: Partial<BabyProfile>) {
    const profileRef = doc(db, 'users', userId, 'profiles', profileId);
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static async deleteProfile(userId: string, profileId: string) {
    const profileRef = doc(db, 'users', userId, 'profiles', profileId);
    await deleteDoc(profileRef);
  }

  // Activity Logs
  static async addLog(userId: string, profileId: string, log: LogEntry) {
    const logRef = doc(collection(db, 'users', userId, 'profiles', profileId, 'logs'));
    await setDoc(logRef, {
      ...log,
      id: logRef.id,
      userId,
      profileId,
      createdAt: new Date().toISOString()
    });
  }

  static async getLogs(userId: string, profileId: string): Promise<LogEntry[]> {
    const logsRef = collection(db, 'users', userId, 'profiles', profileId, 'logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));
  }

  static async updateLog(userId: string, profileId: string, logId: string, updates: Partial<LogEntry>) {
    const logRef = doc(db, 'users', userId, 'profiles', profileId, 'logs', logId);
    await updateDoc(logRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static async deleteLog(userId: string, profileId: string, logId: string) {
    const logRef = doc(db, 'users', userId, 'profiles', profileId, 'logs', logId);
    await deleteDoc(logRef);
  }

  // Inventory
  static async updateInventory(userId: string, profileId: string, inventory: Inventory) {
    const inventoryRef = doc(db, 'users', userId, 'profiles', profileId, 'data', 'inventory');
    await setDoc(inventoryRef, {
      ...inventory,
      updatedAt: new Date().toISOString()
    });
  }

  static async getInventory(userId: string, profileId: string): Promise<Inventory | null> {
    const inventoryRef = doc(db, 'users', userId, 'profiles', profileId, 'data', 'inventory');
    const snapshot = await getDoc(inventoryRef);
    return snapshot.exists() ? snapshot.data() as Inventory : null;
  }

  // Reminders
  static async addReminder(userId: string, profileId: string, reminder: Reminder) {
    const reminderRef = doc(collection(db, 'users', userId, 'profiles', profileId, 'reminders'));
    await setDoc(reminderRef, {
      ...reminder,
      id: reminderRef.id,
      userId,
      profileId,
      createdAt: new Date().toISOString()
    });
  }

  static async getReminders(userId: string, profileId: string): Promise<Reminder[]> {
    const remindersRef = collection(db, 'users', userId, 'profiles', profileId, 'reminders');
    const q = query(remindersRef, orderBy('time', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
  }

  static async updateReminder(userId: string, profileId: string, reminderId: string, updates: Partial<Reminder>) {
    const reminderRef = doc(db, 'users', userId, 'profiles', profileId, 'reminders', reminderId);
    await updateDoc(reminderRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static async deleteReminder(userId: string, profileId: string, reminderId: string) {
    const reminderRef = doc(db, 'users', userId, 'profiles', profileId, 'reminders', reminderId);
    await deleteDoc(reminderRef);
  }

  // Appointments
  static async addAppointment(userId: string, profileId: string, appointment: Appointment) {
    const appointmentRef = doc(collection(db, 'users', userId, 'profiles', profileId, 'appointments'));
    await setDoc(appointmentRef, {
      ...appointment,
      id: appointmentRef.id,
      userId,
      profileId,
      createdAt: new Date().toISOString()
    });
  }

  static async getAppointments(userId: string, profileId: string): Promise<Appointment[]> {
    const appointmentsRef = collection(db, 'users', userId, 'profiles', profileId, 'appointments');
    const q = query(appointmentsRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }

  // Real-time listeners
  static subscribeToProfiles(userId: string, callback: (profiles: BabyProfile[]) => void) {
    const profilesRef = collection(db, 'users', userId, 'profiles');
    const q = query(profilesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BabyProfile));
      callback(profiles);
    });
  }

  static subscribeToLogs(userId: string, profileId: string, callback: (logs: LogEntry[]) => void) {
    const logsRef = collection(db, 'users', userId, 'profiles', profileId, 'logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));
      callback(logs);
    });
  }

  static subscribeToProfile(userId: string, profileId: string, callback: (profile: BabyProfile | null) => void) {
    const profileRef = doc(db, 'users', userId, 'profiles', profileId);
    
    return onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as BabyProfile);
      } else {
        callback(null);
      }
    });
  }

  static subscribeToInventory(userId: string, profileId: string, callback: (inventory: Inventory | null) => void) {
    const inventoryRef = doc(db, 'users', userId, 'profiles', profileId, 'data', 'inventory');
    
    return onSnapshot(inventoryRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as Inventory);
      } else {
        callback(null);
      }
    });
  }

  // Batch operations for better performance
  static async batchUpdateLogs(userId: string, profileId: string, logs: LogEntry[]) {
    const batch = writeBatch(db);
    
    logs.forEach(log => {
      const logRef = doc(collection(db, 'users', userId, 'profiles', profileId, 'logs'));
      batch.set(logRef, {
        ...log,
        id: logRef.id,
        userId,
        profileId,
        createdAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
  }
}

// Storage Service - Will be implemented in future upgrade
// For now, we'll use base64 encoding for small images in Firestore
export class StorageService {
  // Placeholder for future photo upload functionality
  static async uploadBabyPhoto(userId: string, profileId: string, file: File): Promise<string> {
    throw new Error('Photo upload not available in free tier. Upgrade to Firebase Blaze plan for Storage features.');
  }

  static async uploadDocument(userId: string, profileId: string, file: File, type: 'medical' | 'growth' | 'other'): Promise<string> {
    throw new Error('Document upload not available in free tier. Upgrade to Firebase Blaze plan for Storage features.');
  }

  static async deleteFile(fileUrl: string): Promise<void> {
    throw new Error('File deletion not available in free tier. Upgrade to Firebase Blaze plan for Storage features.');
  }

  static async getProfilePhotos(userId: string, profileId: string): Promise<string[]> {
    throw new Error('Photo retrieval not available in free tier. Upgrade to Firebase Blaze plan for Storage features.');
  }

  static async getDocuments(userId: string, profileId: string, type?: string): Promise<string[]> {
    throw new Error('Document retrieval not available in free tier. Upgrade to Firebase Blaze plan for Storage features.');
  }

  // Alternative: Store small images as base64 in Firestore (limited to 1MB per document)
  static async storeImageAsBase64(userId: string, profileId: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.size > 1024 * 1024) { // 1MB limit
        reject(new Error('File too large for base64 storage. Use Firebase Storage for larger files.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
} 