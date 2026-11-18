import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserProfile, AuthorizationRole, BusinessAccountType } from '../types'
import { DemoPersona } from '../config/demo'

export interface AuthSignInResult {
  user: User
  profile: UserProfile | null
  isAdmin: boolean
  role: AuthorizationRole
}

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  authRole: AuthorizationRole | null
  isAdmin: boolean
  loading: boolean
  profileLoading: boolean
  authError: string | null
  isDemoMode: boolean
  demoPersona: DemoPersona | null
  enterDemoMode: (persona: DemoPersona) => void
  exitDemoMode: () => void
  signUp: (email: string, password: string, name: string, role?: BusinessAccountType) => Promise<any>
  signIn: (email: string, password: string) => Promise<AuthSignInResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Normalizes Supabase, HTTP, and network errors into clear, actionable messages.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.'
  const message = error.message || error.error_description || String(error)
  const lower = message.toLowerCase()
  const status = error.status || error.statusCode

  // 1. Check physical device internet connectivity
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'No internet connection detected on your device. Please reconnect to the internet and try again.'
  }

  // 2. Specific HTTP Status Codes
  if (status === 401 || lower.includes('invalid api key') || lower.includes('apikey')) {
    return 'Supabase authentication failed (HTTP 401: Invalid API Key). Please verify that VITE_SUPABASE_ANON_KEY in your environment configuration is correct.'
  }

  if (status === 404) {
    return 'Supabase authentication endpoint not found (HTTP 404). Please verify that VITE_SUPABASE_URL points to a valid Supabase project.'
  }

  // 3. DNS and host resolution failure (e.g. project paused, domain nonexistent)
  if (
    lower.includes('enotfound') ||
    lower.includes('err_name_not_resolved') ||
    lower.includes('name_error')
  ) {
    return 'Unable to reach the Supabase authentication server (DNS resolution failed). The project may be paused in your Supabase dashboard or the project URL in .env.local is unreachable. Please verify your Supabase project status.'
  }

  // 4. Supabase Auth specific error codes and messages
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid_grant') ||
    lower.includes('invalid_credentials') ||
    lower.includes('user not found')
  ) {
    return 'Invalid email or password. Please verify your credentials and try again.'
  }

  if (
    lower.includes('email not confirmed') ||
    lower.includes('email address not confirmed')
  ) {
    return 'Please confirm your email address via the verification link sent to your inbox before signing in.'
  }

  if (
    lower.includes('jwt expired') ||
    lower.includes('token is expired') ||
    lower.includes('session expired') ||
    lower.includes('invalid refresh token')
  ) {
    return 'Your session has expired. Please sign in again.'
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already exists') ||
    lower.includes('user_already_exists')
  ) {
    return 'An account with this email address already exists. Please sign in instead.'
  }

  if (
    lower.includes('password should be at least') ||
    lower.includes('weak_password')
  ) {
    return 'Password must be at least 6 characters long.'
  }

  // 5. Network / fetch failures when internet connection is active
  if (
    lower.includes('fetch failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkrequestfailed') ||
    lower.includes('econnrefused') ||
    lower.includes('timeout')
  ) {
    return 'Network request to Supabase failed. Please check that your Supabase project is active (not paused) and that VITE_SUPABASE_URL is reachable.'
  }

  return message
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Demo mode is explicitly disabled in favor of real Supabase authentication
  const isDemoMode = false
  const demoPersona: DemoPersona | null = null

  const enterDemoMode = useCallback((_persona: DemoPersona) => {
    console.warn('[AuthContext] Demo mode is disabled. Real Supabase authentication is active.')
  }, [])

  const exitDemoMode = useCallback(() => {
    // Inert callback retained for API compatibility
  }, [])

  /**
   * Fetches user profile from public.users table.
   * This is the trusted source for the is_admin authorization flag.
   * If record is not found, safely provides an unprivileged fallback profile.
   */
  const fetchProfile = useCallback(async (userId: string, currentUser?: User | null): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('[AuthContext] Unable to read profile from public.users:', error.message)
      }

      if (data) {
        return data as UserProfile
      }

      // If record is missing in public.users, attempt client-side creation for authenticated user
      if (currentUser && currentUser.id === userId) {
        const fallbackName = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User'
        const fallbackRole = (currentUser.user_metadata?.account_type as BusinessAccountType) || 'Project Developer'

        const { data: created, error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            name: fallbackName,
            email: currentUser.email || '',
            role: fallbackRole,
            is_admin: false,
            is_disabled: false,
            credits: 1000.0,
            member_since: new Date().toISOString(),
            additional_data: {}
          })
          .select('*')
          .maybeSingle()

        if (!insertError && created) {
          return created as UserProfile
        }

        // Safe in-memory fallback: strictly standard user (is_admin = false)
        return {
          id: userId,
          email: currentUser.email || '',
          name: fallbackName,
          role: fallbackRole,
          is_admin: false,
          is_disabled: false,
          credits: 0,
          kyc_status: 'Pending',
          member_since: currentUser.created_at || new Date().toISOString(),
          additional_data: {}
        }
      }

      return null
    } catch (err) {
      console.error('[AuthContext] Unexpected error querying public.users:', err)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (!isMounted) return

        if (sessionError) {
          console.warn('[AuthContext] Session retrieval error:', sessionError.message)
        }

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          setProfileLoading(true)
          const userProfile = await fetchProfile(currentUser.id, currentUser)
          if (isMounted) {
            if (userProfile?.is_disabled) {
              await supabase.auth.signOut()
              setUser(null)
              setProfile(null)
              setAuthError('This account has been disabled. Please contact system support.')
            } else {
              setProfile(userProfile)
            }
          }
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('[AuthContext] Auth initialization error:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
          setProfileLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
        setProfileLoading(false)
        return
      }

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        setProfileLoading(true)
        const userProfile = await fetchProfile(currentUser.id, currentUser)
        if (isMounted) {
          if (userProfile?.is_disabled) {
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setAuthError('This account has been disabled. Please contact system support.')
          } else {
            setProfile(userProfile)
          }
          setProfileLoading(false)
        }
      } else {
        setProfile(null)
        setProfileLoading(false)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null
    setProfileLoading(true)
    const userProfile = await fetchProfile(user.id, user)
    setProfile(userProfile)
    setProfileLoading(false)
    return userProfile
  }, [user, fetchProfile])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: BusinessAccountType = 'Project Developer'
  ) => {
    setAuthError(null)
    try {
      // 1. Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            account_type: role
          }
        }
      })

      if (error) throw error

      // 2. Persist to public.users table (is_admin = false enforced)
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: name.trim(),
            email: email.trim(),
            role,
            is_admin: false,
            is_disabled: false,
            credits: 1000.0,
            member_since: new Date().toISOString(),
            additional_data: {}
          })

        if (profileError) {
          console.warn('[AuthContext] Note on user profile creation:', profileError.message)
        }

        if (data.session) {
          const userProfile = await fetchProfile(data.user.id, data.user)
          setProfile(userProfile)
          setUser(data.user)
        }
      }

      return data
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Registration network/service error:', {
          name: err?.name,
          message: err?.message,
          status: err?.status,
          code: err?.code,
          cause: err?.cause?.message || err?.cause
        })
      }
      const friendly = formatAuthError(err)
      setAuthError(friendly)
      throw new Error(friendly)
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthSignInResult> => {
    setAuthError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) throw error
      if (!data.user) throw new Error('Sign in succeeded but user object was not returned.')

      // Fetch trusted profile from database
      const userProfile = await fetchProfile(data.user.id, data.user)

      // Check disabled state
      if (userProfile?.is_disabled) {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        const disabledErr = 'This account has been disabled. Please contact system support.'
        setAuthError(disabledErr)
        throw new Error(disabledErr)
      }

      // Resolve authorization role strictly from trusted is_admin column
      const isAdmin = Boolean(userProfile?.is_admin === true)
      const authRole: AuthorizationRole = isAdmin ? 'admin' : 'user'

      setUser(data.user)
      setProfile(userProfile)

      return {
        user: data.user,
        profile: userProfile,
        isAdmin,
        role: authRole
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Sign in network/service error:', {
          name: err?.name,
          message: err?.message,
          status: err?.status,
          code: err?.code,
          cause: err?.cause?.message || err?.cause
        })
      }
      const friendly = formatAuthError(err)
      setAuthError(friendly)
      throw new Error(friendly)
    }
  }

  const signOut = async () => {
    setAuthError(null)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('[AuthContext] Error during Supabase signOut:', err)
    } finally {
      setUser(null)
      setProfile(null)
    }
  }

  // Trusted authorization signals
  const isAdmin = Boolean(profile?.is_admin === true)
  const authRole: AuthorizationRole | null = user ? (isAdmin ? 'admin' : 'user') : null

  const value: AuthContextType = {
    user,
    profile,
    authRole,
    isAdmin,
    loading,
    profileLoading,
    authError,
    isDemoMode,
    demoPersona,
    enterDemoMode,
    exitDemoMode,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    clearAuthError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

