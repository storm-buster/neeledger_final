import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qxrrnshyswsxznuydyfg.supabase.co'
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cnJuc2h5c3dzeHpudXlkeWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDk5ODgsImV4cCI6MjA5MDY4NTk4OH0.cAk10UfA5Hlpqv768gcwjeIMnFD8DdFCdJ60yTlW3HQ'

// Sanitize inputs (strip trailing slashes and accidental leading/trailing whitespace)
export const supabaseUrl = rawUrl.trim().replace(/\/+$/, '')
export const supabaseAnonKey = rawAnonKey.trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})


