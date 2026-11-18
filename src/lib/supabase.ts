import { createClient } from '@supabase/supabase-js'

function resolveSupabaseUrl(): string {
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  if (envUrl && envUrl.trim() && !envUrl.includes('qxrrnshyswsxznuydyfg.supabase.co')) {
    return envUrl.trim().replace(/\/+$/, '')
  }
  // When running in a deployed browser environment (e.g. Vercel), route through current origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:4000'
}

function resolveSupabaseKey(): string {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (envKey && envKey.trim()) {
    return envKey.trim()
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZWxlZGdlciIsInJvbGUiOiJub24iLCJpYXQiOjE3NzUxMDk5ODgsImV4cCI6MjA5MDY4NTk4OH0.mock_signature_for_local_and_vercel'
}

// Sanitize inputs (strip trailing slashes and accidental leading/trailing whitespace)
export const supabaseUrl = resolveSupabaseUrl()
export const supabaseAnonKey = resolveSupabaseKey()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})
