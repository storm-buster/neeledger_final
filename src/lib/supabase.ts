import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qxrrnshyswsxznuydyfg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cnJuc2h5c3dzeHpudXlkeWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDk5ODgsImV4cCI6MjA5MDY4NTk4OH0.cAk10UfA5Hlpqv768gcwjeIMnFD8DdFCdJ60yTlW3HQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
