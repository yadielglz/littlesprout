import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BabyProfile {
  id: string
  userName: string
  babyName: string
  dob: string
  createdAt: string
}

export interface LogEntry {
  id: string
  type: string
  icon: string
  color: string
  details: string
  timestamp: Date
  notes?: string
  rawAmount?: number
  rawDuration?: number
}

export interface Memory {
  id: string
  date: string
  image: string
  description: string
}

export interface Inventory {
  diapers: number
  formula: number
  wipes?: number
  diapersSize?: string
}

export interface Reminder {
  id: string
  text: string
  time: number
  frequency: 'none' | 'daily' | 'weekly'
  isActive: boolean
}

export interface CustomActivity {
  id: string
  name: string
  icon: string
  color: string
  isCustom: boolean
}

export interface AchievedMilestone {
  id: string
  date: string
}

export interface ActiveTimer {
  type: string
  startTime: number
}

interface AppState {
  profiles: BabyProfile[]
  currentProfileId: string | null
  logs: Record<string, LogEntry[]>
  memories: Record<string, Memory[]>
  inventories: Record<string, Inventory>
  reminders: Record<string, Reminder[]>
  customActivities: CustomActivity[]
  achievedMilestones: Record<string, AchievedMilestone[]>
  activeTimer: ActiveTimer | null
  isDarkMode: boolean
  sidebarOpen: boolean
  setProfiles: (profiles: BabyProfile[]) => void
  addProfile: (profile: BabyProfile) => void
  updateProfile: (id: string, updates: Partial<BabyProfile>) => void
  deleteProfile: (id: string) => void
  setCurrentProfileId: (id: string | null) => void
  setLogs: (profileId: string, logs: LogEntry[]) => void
  addLog: (profileId: string, log: LogEntry) => void
  updateLog: (profileId: string, logId: string, updates: Partial<LogEntry>) => void
  deleteLog: (profileId: string, logId: string) => void
  setMemories: (profileId: string, memories: Memory[]) => void
  addMemory: (profileId: string, memory: Memory) => void
  deleteMemory: (profileId: string, memoryId: string) => void
  setInventory: (profileId: string, inventory: Inventory) => void
  updateInventory: (profileId: string, item: keyof Inventory, change: number) => void
  setReminders: (profileId: string, reminders: Reminder[]) => void
  addReminder: (profileId: string, reminder: Reminder) => void
  updateReminder: (profileId: string, reminderId: string, updates: Partial<Reminder>) => void
  deleteReminder: (profileId: string, reminderId: string) => void
  setCustomActivities: (activities: CustomActivity[]) => void
  addCustomActivity: (activity: CustomActivity) => void
  deleteCustomActivity: (activityId: string) => void
  setAchievedMilestones: (profileId: string, milestones: AchievedMilestone[]) => void
  addAchievedMilestone: (profileId: string, milestone: AchievedMilestone) => void
  setActiveTimer: (timer: ActiveTimer | null) => void
  toggleDarkMode: () => void
  setDarkMode: (isDark: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  getCurrentProfile: () => BabyProfile | null
  getCurrentLogs: () => LogEntry[]
  getCurrentMemories: () => Memory[]
  getCurrentInventory: () => Inventory
  getCurrentReminders: () => Reminder[]
  getCurrentAchievedMilestones: () => AchievedMilestone[]
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      currentProfileId: null,
      logs: {},
      memories: {},
      inventories: {},
      reminders: {},
      customActivities: [],
      achievedMilestones: {},
      activeTimer: null,
      isDarkMode: false,
      sidebarOpen: false,
      setProfiles: (profiles) => set({ profiles }),
      addProfile: (profile) => set((state) => ({ 
        profiles: [...state.profiles, profile],
        currentProfileId: profile.id 
      })),
      updateProfile: (id, updates) => set((state) => ({
        profiles: state.profiles.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProfile: (id) => set((state) => {
        const newProfiles = state.profiles.filter(p => p.id !== id)
        const newCurrentId = state.currentProfileId === id 
          ? (newProfiles.length > 0 ? newProfiles[0].id : null)
          : state.currentProfileId
        return { 
          profiles: newProfiles, 
          currentProfileId: newCurrentId 
        }
      }),
      setCurrentProfileId: (id) => set({ currentProfileId: id }),
      setLogs: (profileId, logs) => set((state) => ({
        logs: { ...state.logs, [profileId]: logs }
      })),
      addLog: (profileId, log) => set((state) => ({
        logs: { 
          ...state.logs, 
          [profileId]: [...(state.logs[profileId] || []), log] 
        }
      })),
      updateLog: (profileId, logId, updates) => set((state) => ({
        logs: {
          ...state.logs,
          [profileId]: (state.logs[profileId] || []).map(log =>
            log.id === logId ? { ...log, ...updates } : log
          )
        }
      })),
      deleteLog: (profileId, logId) => set((state) => ({
        logs: {
          ...state.logs,
          [profileId]: (state.logs[profileId] || []).filter(log => log.id !== logId)
        }
      })),
      setMemories: (profileId, memories) => set((state) => ({
        memories: { ...state.memories, [profileId]: memories }
      })),
      addMemory: (profileId, memory) => set((state) => ({
        memories: { 
          ...state.memories, 
          [profileId]: [...(state.memories[profileId] || []), memory] 
        }
      })),
      deleteMemory: (profileId, memoryId) => set((state) => ({
        memories: {
          ...state.memories,
          [profileId]: (state.memories[profileId] || []).filter(m => m.id !== memoryId)
        }
      })),
      setInventory: (profileId, inventory) => set((state) => ({
        inventories: { ...state.inventories, [profileId]: inventory }
      })),
      updateInventory: (profileId, item, change) => set((state) => ({
        inventories: {
          ...state.inventories,
          [profileId]: {
            ...state.inventories[profileId],
            [item]: Math.max(0, Number(state.inventories[profileId]?.[item] || 0) + change)
          }
        }
      })),
      setReminders: (profileId, reminders) => set((state) => ({
        reminders: { ...state.reminders, [profileId]: reminders }
      })),
      addReminder: (profileId, reminder) => set((state) => ({
        reminders: { 
          ...state.reminders, 
          [profileId]: [...(state.reminders[profileId] || []), reminder] 
        }
      })),
      updateReminder: (profileId, reminderId, updates) => set((state) => ({
        reminders: {
          ...state.reminders,
          [profileId]: (state.reminders[profileId] || []).map(reminder =>
            reminder.id === reminderId ? { ...reminder, ...updates } : reminder
          )
        }
      })),
      deleteReminder: (profileId, reminderId) => set((state) => ({
        reminders: {
          ...state.reminders,
          [profileId]: (state.reminders[profileId] || []).filter(r => r.id !== reminderId)
        }
      })),
      setCustomActivities: (activities) => set({ customActivities: activities }),
      addCustomActivity: (activity) => set((state) => ({
        customActivities: [...state.customActivities, activity]
      })),
      deleteCustomActivity: (activityId) => set((state) => ({
        customActivities: state.customActivities.filter(a => a.id !== activityId)
      })),
      setAchievedMilestones: (profileId, milestones) => set((state) => ({
        achievedMilestones: { ...state.achievedMilestones, [profileId]: milestones }
      })),
      addAchievedMilestone: (profileId, milestone) => set((state) => ({
        achievedMilestones: { 
          ...state.achievedMilestones, 
          [profileId]: [...(state.achievedMilestones[profileId] || []), milestone] 
        }
      })),
      setActiveTimer: (timer) => set({ activeTimer: timer }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      getCurrentProfile: () => {
        const state = get()
        return state.profiles.find(p => p.id === state.currentProfileId) || null
      },
      getCurrentLogs: () => {
        const state = get()
        return state.logs[state.currentProfileId || ''] || []
      },
      getCurrentMemories: () => {
        const state = get()
        return state.memories[state.currentProfileId || ''] || []
      },
      getCurrentInventory: () => {
        const state = get()
        return state.inventories[state.currentProfileId || ''] || { diapers: 0, formula: 0 }
      },
      getCurrentReminders: () => {
        const state = get()
        return state.reminders[state.currentProfileId || ''] || []
      },
      getCurrentAchievedMilestones: () => {
        const state = get()
        return state.achievedMilestones[state.currentProfileId || ''] || []
      },
    }),
    {
      name: 'littlesprout-storage',
      partialize: (state) => ({
        profiles: state.profiles,
        currentProfileId: state.currentProfileId,
        logs: state.logs,
        memories: state.memories,
        inventories: state.inventories,
        reminders: state.reminders,
        customActivities: state.customActivities,
        achievedMilestones: state.achievedMilestones,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
) 