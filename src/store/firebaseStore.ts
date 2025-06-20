import { create } from 'zustand';
import { DatabaseService } from '../services/firebase';
import { useStore, BabyProfile, LogEntry, Inventory, Reminder, Appointment } from './store';

interface FirebaseStore {
  // Firebase-specific methods
  syncWithFirebase: (userId: string) => Promise<void>;
  subscribeToRealTimeUpdates: (userId: string) => void;
  unsubscribeFromUpdates: () => void;
  migrateLocalData: (userId: string) => Promise<void>;
  createProfile: (userId: string, profile: BabyProfile) => Promise<void>;
  _unsubscribers: { [key: string]: () => void } | null;
}

export const useFirebaseStore = create<FirebaseStore>((set, get) => ({
  _unsubscribers: null,
  
  createProfile: async (userId: string, profile: BabyProfile) => {
    await DatabaseService.createProfile(userId, profile);
    // The real-time listener will update the local state automatically
  },

  syncWithFirebase: async (userId: string) => {
    try {
      const { profiles: localProfiles, currentProfileId: localCurrentProfileId } = useStore.getState();

      // Only fetch profiles if they are not already populated
      if (localProfiles.length === 0) {
        const profiles = await DatabaseService.getProfiles(userId);
        useStore.setState({ profiles });
        if (profiles.length > 0 && !localCurrentProfileId) {
          useStore.setState({ currentProfileId: profiles[0].id });
        }
      }

      const currentProfileId = useStore.getState().currentProfileId;
      if (currentProfileId) {
        const logs = await DatabaseService.getLogs(userId, currentProfileId);
        const inventory = await DatabaseService.getInventory(userId, currentProfileId);
        const reminders = await DatabaseService.getReminders(userId, currentProfileId);
        const appointments = await DatabaseService.getAppointments(userId, currentProfileId);

        useStore.setState({
          logs: { [currentProfileId]: logs },
          inventories: { [currentProfileId]: inventory || { diapers: 0, formula: 0 } },
          reminders: { [currentProfileId]: reminders },
          appointments: { [currentProfileId]: appointments }
        });
      }
    } catch (error) {
      console.error('Firebase sync error:', error);
      throw error;
    }
  },

  subscribeToRealTimeUpdates: (userId: string) => {
    // Subscribe to the list of profiles
    const unsubscribeProfiles = DatabaseService.subscribeToProfiles(userId, (profiles: BabyProfile[]) => {
      const { profiles: localProfiles, currentProfileId } = useStore.getState();
      
      // Only update if the profiles have actually changed to prevent loops
      if (JSON.stringify(profiles) !== JSON.stringify(localProfiles)) {
        useStore.setState({ profiles });
      }

      // If there's no current profile selected, or the selected one was deleted, select the first one
      if (profiles.length > 0 && (!currentProfileId || !profiles.some((p: BabyProfile) => p.id === currentProfileId))) {
        useStore.setState({ currentProfileId: profiles[0].id });
      } else if (profiles.length === 0) {
        useStore.setState({ currentProfileId: null });
      }
    });

    const { currentProfileId } = useStore.getState();
    if (!currentProfileId) {
      set({ _unsubscribers: { profiles: unsubscribeProfiles } });
      return;
    }

    // Subscribe to logs
    const unsubscribeLogs = DatabaseService.subscribeToLogs(
      userId,
      currentProfileId,
      (logs) => {
        useStore.setState({ logs: { [currentProfileId]: logs } });
      }
    );

    // Subscribe to profile
    const unsubscribeProfile = DatabaseService.subscribeToProfile(
      userId,
      currentProfileId,
      (profile) => {
        if (profile) {
          useStore.setState((state) => ({
            profiles: state.profiles.map((p: BabyProfile) => 
              p.id === profile.id ? profile : p
            )
          }));
        }
      }
    );

    // Subscribe to inventory
    const unsubscribeInventory = DatabaseService.subscribeToInventory(
      userId,
      currentProfileId,
      (inventory) => {
        useStore.setState({ inventories: { [currentProfileId]: inventory || { diapers: 0, formula: 0 } } });
      }
    );

    // Store unsubscribe functions
    set({ 
      _unsubscribers: { 
        profiles: unsubscribeProfiles,
        logs: unsubscribeLogs, 
        profile: unsubscribeProfile,
        inventory: unsubscribeInventory
      }
    });
  },

  unsubscribeFromUpdates: () => {
    const { _unsubscribers } = get();
    if (_unsubscribers) {
      Object.values(_unsubscribers).forEach(unsub => unsub());
      set({ _unsubscribers: null });
    }
  },

  migrateLocalData: async (userId: string) => {
    const state = useStore.getState();
    
    try {
      // Migrate profiles
      for (const profile of state.profiles) {
        await DatabaseService.createProfile(userId, profile);
      }

      // Migrate logs for each profile
      for (const [profileId, logs] of Object.entries(state.logs)) {
        if (logs.length > 0) {
          await DatabaseService.batchUpdateLogs(userId, profileId, logs);
        }
      }

      // Migrate inventory
      for (const [profileId, inventory] of Object.entries(state.inventories)) {
        await DatabaseService.updateInventory(userId, profileId, inventory);
      }

      // Migrate reminders
      for (const [profileId, reminders] of Object.entries(state.reminders)) {
        for (const reminder of reminders) {
          await DatabaseService.addReminder(userId, profileId, reminder);
        }
      }

      // Migrate appointments
      for (const [profileId, appointments] of Object.entries(state.appointments)) {
        for (const appointment of appointments) {
          await DatabaseService.addAppointment(userId, profileId, appointment);
        }
      }

      console.log('Local data migration completed');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
})); 