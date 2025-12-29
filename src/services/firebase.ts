import { useStore, BabyProfile, LogEntry, Inventory, Reminder, Appointment } from '../store/store'

const getState = () => useStore.getState()

export const DatabaseService = {
  async createProfile(_userId: string, profile: BabyProfile) {
    return Promise.resolve(profile)
  },

  async getProfiles(_userId: string): Promise<BabyProfile[]> {
    return getState().profiles
  },

  async updateProfile(_userId: string, profileId: string, updates: Partial<BabyProfile>) {
    return Promise.resolve({ profileId, updates })
  },

  async deleteProfile(_userId: string, profileId: string) {
    return Promise.resolve(profileId)
  },

  async addLog(_userId: string, profileId: string, log: LogEntry) {
    return Promise.resolve({ profileId, log })
  },

  async getLogs(_userId: string, profileId: string): Promise<LogEntry[]> {
    return getState().logs[profileId] || []
  },

  async updateLog(_userId: string, profileId: string, logId: string, updates: Partial<LogEntry>) {
    return Promise.resolve({ profileId, logId, updates })
  },

  async deleteLog(_userId: string, profileId: string, logId: string) {
    return Promise.resolve({ profileId, logId })
  },

  async updateInventory(_userId: string, profileId: string, inventory: Inventory) {
    return Promise.resolve({ profileId, inventory })
  },

  async getInventory(_userId: string, profileId: string): Promise<Inventory | null> {
    return getState().inventories[profileId] || null
  },

  async addReminder(_userId: string, profileId: string, reminder: Reminder) {
    return Promise.resolve({ profileId, reminder })
  },

  async getReminders(_userId: string, profileId: string): Promise<Reminder[]> {
    return getState().reminders[profileId] || []
  },

  async updateReminder(_userId: string, profileId: string, reminderId: string, updates: Partial<Reminder>) {
    return Promise.resolve({ profileId, reminderId, updates })
  },

  async deleteReminder(_userId: string, profileId: string, reminderId: string) {
    return Promise.resolve({ profileId, reminderId })
  },

  async addAppointment(_userId: string, profileId: string, appointment: Appointment) {
    return Promise.resolve({ profileId, appointment })
  },

  async getAppointments(_userId: string, profileId: string): Promise<Appointment[]> {
    return getState().appointments[profileId] || []
  },

  async updateAppointment(_userId: string, profileId: string, appointmentId: string, updates: Partial<Appointment>) {
    return Promise.resolve({ profileId, appointmentId, updates })
  },

  async deleteAppointment(_userId: string, profileId: string, appointmentId: string) {
    return Promise.resolve({ profileId, appointmentId })
  },

  subscribeToProfiles(_userId: string, callback: (profiles: BabyProfile[]) => void) {
    callback(getState().profiles)
    return () => {}
  },

  subscribeToLogs(_userId: string, profileId: string, callback: (logs: LogEntry[]) => void) {
    callback(getState().logs[profileId] || [])
    return () => {}
  },

  subscribeToProfile(_userId: string, profileId: string, callback: (profile: BabyProfile | null) => void) {
    const state = getState()
    callback(state.profiles.find((p: BabyProfile) => p.id === profileId) || null)
    return () => {}
  },

  subscribeToInventory(_userId: string, profileId: string, callback: (inventory: Inventory | null) => void) {
    const state = getState()
    callback(state.inventories[profileId] || null)
    return () => {}
  },

  async clearAllDataForProfile(_userId: string, profileId: string) {
    return Promise.resolve(profileId)
  },

  async exportData(_userId: string, profileId: string): Promise<any> {
    const state = getState()
    return {
      logs: state.logs[profileId] || [],
      reminders: state.reminders[profileId] || [],
      appointments: state.appointments[profileId] || [],
      inventory: state.inventories[profileId] || null
    }
  },

  async importData(): Promise<void> {
    return Promise.resolve()
  }
}

export class StorageService {
  static async uploadBabyPhoto(): Promise<string> {
    throw new Error('Cloud storage disabled in local-only mode.')
  }

  static async uploadDocument(): Promise<string> {
    throw new Error('Cloud storage disabled in local-only mode.')
  }

  static async deleteFile(): Promise<void> {
    return Promise.resolve()
  }

  static async getProfilePhotos(): Promise<string[]> {
    return []
  }

  static async getDocuments(): Promise<string[]> {
    return []
  }

  static async storeImageAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.size > 1024 * 1024) {
        reject(new Error('File too large for base64 storage.'))
        return
      }

      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }
}