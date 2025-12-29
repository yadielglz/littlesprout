import { supabase } from '../lib/supabaseClient'

export async function uploadFile(file: File) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data: authData, error: authErr } = await supabase.auth.getUser()
  if (authErr) throw authErr
  const userId = authData.user.id

  const path = `${userId}/${crypto.randomUUID()}-${file.name}`

  const { data, error } = await supabase.storage.from('uploads').upload(path, file, { upsert: false })
  if (error) throw error
  return data.path
}

export async function getSignedUrl(path: string) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.storage.from('uploads').createSignedUrl(path, 60 * 10)
  if (error) throw error
  return data.signedUrl
}

