// Firebase removed: export lightweight stubs so existing imports keep working.

export const auth = {
  // minimal shape for auth consumers
  currentUser: { uid: 'local-user', email: 'offline@local' }
} as const

export const db = {} as const

const app = {} as const

export default app