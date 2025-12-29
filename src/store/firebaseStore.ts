import { create } from 'zustand'
import { useStore, BabyProfile, Reminder, Appointment } from './store'
import { withErrorHandling } from '../utils/errorHandler'

interface FirebaseStore {
  syncWithFirebase: (userId: string) => Promise<void>
  subscribeToRealTimeUpdates: (userId: string) => void
  unsubscribeFromUpdates: () => void
  migrateLocalData: (userId: string) => Promise<void>
  createProfile: (userId: string, profile: BabyProfile) => Promise<void>
  _unsubscribers: { [key: string]: () => void } | null
  addReminderToFirebase: (userId: string, profileId: string, reminder: Reminder) => Promise<void>
  updateReminderInFirebase: (userId: string, profileId: string, reminderId: string, updates: Partial<Reminder>) => Promise<void>
  deleteReminderFromFirebase: (userId: string, profileId: string, reminderId: string) => Promise<void>
  addAppointmentToFirebase: (userId: string, profileId: string, appointment: Appointment) => Promise<void>
  updateAppointmentInFirebase: (userId: string, profileId: string, appointmentId: string, updates: Partial<Appointment>) => Promise<void>
  deleteAppointmentFromFirebase: (userId: string, profileId: string, appointmentId: string) => Promise<void>
}

export const useFirebaseStore = create<FirebaseStore>((set, get) => ({
  _unsubscribers: null,
  
  createProfile: async (userId: string, profile: BabyProfile) => {
    return withErrorHandling(async () => {
      useStore.getState().addProfile(profile)
    }, 'Create profile')
  },

  addReminderToFirebase: async (userId: string, profileId: string, reminder: Reminder) => {
    return withErrorHandling(async () => {
      useStore.getState().addReminder(profileId, reminder)
    }, 'Add reminder')
  },

  updateReminderInFirebase: async (userId: string, profileId: string, reminderId: string, updates: Partial<Reminder>) => {
    return withErrorHandling(async () => {
      useStore.getState().updateReminder(profileId, reminderId, updates)
    }, 'Update reminder')
  },

  deleteReminderFromFirebase: async (userId: string, profileId: string, reminderId: string) => {
    return withErrorHandling(async () => {
      useStore.getState().deleteReminder(profileId, reminderId)
    }, 'Delete reminder')
  },

  addAppointmentToFirebase: async (userId: string, profileId: string, appointment: Appointment) => {
    return withErrorHandling(async () => {
      useStore.getState().addAppointment(profileId, appointment)
    }, 'Add appointment')
  },

  updateAppointmentInFirebase: async (userId: string, profileId: string, appointmentId: string, updates: Partial<Appointment>) => {
    return withErrorHandling(async () => {
      useStore.getState().updateAppointment(profileId, appointmentId, updates)
    }, 'Update appointment')
  },

  deleteAppointmentFromFirebase: async (userId: string, profileId: string, appointmentId: string) => {
    return withErrorHandling(async () => {
      useStore.getState().deleteAppointment(profileId, appointmentId)
    }, 'Delete appointment')
  },

  syncWithFirebase: async (userId: string) => {
    return withErrorHandling(async () => {}, 'Local sync (noop)', undefined, true)
  },

  subscribeToRealTimeUpdates: (userId: string) => {
    set({ _unsubscribers: null })
  },

  unsubscribeFromUpdates: () => {
    set({ _unsubscribers: null })
  },

  migrateLocalData: async (userId: string) => {
    return withErrorHandling(async () => {}, 'Local data migration (noop)')
  }
}))