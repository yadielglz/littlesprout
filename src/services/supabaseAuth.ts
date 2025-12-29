import { supabase } from '../lib/supabaseClient'

const ensureClient = () => {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase
}

export async function signUp(email: string, password: string) {
  return ensureClient().auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  return ensureClient().auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return ensureClient().auth.signOut()
}

