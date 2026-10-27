import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserProfile, AuthorizationRole, BusinessAccountType } from '../types'
import {
  isDemoModeAllowed,
  getStoredDemoPersona,
  setStoredDemoPersona,
  DEMO_USER_PROFILE,
  DEMO_ADMIN_PROFILE,
  DemoPersona
} from '../config/demo'

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
 * Normalizes Supabase, HTTP, and network errors into clear, user-friendly messages.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.'
  const message = error.message || error.error_description || String(error)
  const lower = message.toLowerCase()

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Invalid email or password. Please verify your credentials and try again.'
  }
  if (
    lower.includes('network') ||
    lower.includes('failed to fetch') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused')
  ) {
    return 'Unable to reach the authentication service. Please check your internet connection and try again.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email address already exists. Please sign in instead.'
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.'
  }
  return message
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [demoPersona, setDemoPersona] = useState<DemoPersona | null>(() => getStoredDemoPersona())
  const isDemoMode = Boolean(demoPersona && isDemoModeAllowed())

  /**
   * Activates local demo preview mode for presentations/evaluations.
   * Completely bypasses Supabase auth without real credentials or database writes.
   */
  const enterDemoMode = useCallback((persona: DemoPersona) => {
    if (!isDemoModeAllowed()) {
      console.warn('[AuthContext] Demo mode is disabled in production.')
      return
    }
    setStoredDemoPersona(persona)
    setDemoPersona(persona)
    const demoProfile = persona === 'admin' ? DEMO_ADMIN_PROFILE : DEMO_USER_PROFILE
    setProfile(demoProfile)
    setUser({
      id: demoProfile.id,
      email: demoProfile.email,
      app_metadata: {},
      user_metadata: { name: demoProfile.name, is_demo: true },
      aud: 'authenticated',
      created_at: demoProfile.member_since || new Date().toISOString()
    } as User)
    setAuthError(null)
    setLoading(false)
    setProfileLoading(false)
  }, [])

  /**
   * Exits demo preview mode and clears local persona from session storage.
   */
  const exitDemoMode = useCallback(() => {
    setStoredDemoPersona(null)
    setDemoPersona(null)
    setUser(null)
    setProfile(null)
    setAuthError(null)
  }, [])

  /**
   * Fetches user profile from public.users table.
   * This is the trusted source for the is_admin authorization flag.
   */
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('[AuthContext] Unable to read profile from public.users:', error.message)
        return null
      }

      if (!data) {
        console.warn(`[AuthContext] No public.users record for ${userId}. Defaulting to standard user permissions.`)
        return null
      }

      return data as UserProfile
    } catch (err) {
      console.error('[AuthContext] Unexpected error querying public.users:', err)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      // If demo mode is active from stored session, restore mock session immediately
      if (isDemoModeAllowed()) {
        const stored = getStoredDemoPersona()
        if (stored) {
          enterDemoMode(stored)
          return
        }
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          setProfileLoading(true)
          const userProfile = await fetchProfile(currentUser.id)
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      // If in demo mode, ignore remote auth events
      if (getStoredDemoPersona() && isDemoModeAllowed()) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        setProfileLoading(true)
        const userProfile = await fetchProfile(currentUser.id)
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
    const userProfile = await fetchProfile(user.id)
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
      // Business account type stored for profile display only, NEVER for admin authorization
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            account_type: role
          }
        }
      })

      if (error) throw error

      // 2. Persist to public.users table
      // CRITICAL SECURITY RULE: is_admin is explicitly hardcoded to false on signup.
      // Admin privilege can never be granted by the client through signup parameters.
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name,
            email,
            role, // Business account type
            is_admin: false, // Non-escalatable server column
            is_disabled: false,
            credits: 1000.0,
            member_since: new Date().toISOString(),
            additional_data: {}
          })

        if (profileError) {
          console.warn('[AuthContext] Note on user profile creation:', profileError.message)
        }

        const userProfile = await fetchProfile(data.user.id)
        setProfile(userProfile)
      }

      return data
    } catch (err: any) {
      const friendly = formatAuthError(err)
      setAuthError(friendly)
      throw new Error(friendly)
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthSignInResult> => {
    setAuthError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      if (!data.user) throw new Error('Sign in succeeded but user object was not returned.')

      // Fetch trusted profile from database
      const userProfile = await fetchProfile(data.user.id)

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
      const friendly = formatAuthError(err)
      setAuthError(friendly)
      throw new Error(friendly)
    }
  }

  const signOut = async () => {
    setAuthError(null)
    if (isDemoMode) {
      exitDemoMode()
      return
    }
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    if (error) throw error
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
