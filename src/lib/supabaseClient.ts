import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let supabase: SupabaseClient | null = null

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Running without Supabase client.')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

