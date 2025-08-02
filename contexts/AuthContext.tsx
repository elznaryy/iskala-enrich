'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  error: any
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, firstName: string, lastName: string, company: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  retryAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId)
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      })

      const { data, error } = await Promise.race([profilePromise, timeoutPromise])

      if (error) {
        console.error('AuthContext: Error fetching profile:', error)
        setProfile(null)
      } else {
        console.log('AuthContext: Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (err) {
      console.error('AuthContext: Exception fetching profile:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    console.log('AuthContext: Simple auth check starting...')
    
    // Simple session check without retries or timeouts
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthContext: Session check result:', session ? 'Found user' : 'No user')
      
      if (error) {
        console.error('AuthContext: Session error:', error)
        setError(error)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      // Set loading to false immediately, fetch profile in background
      setLoading(false)
      
      // Fetch profile if user exists - in background, don't block loading
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 100)
      }
    }).catch((err) => {
      console.error('AuthContext: Session check failed:', err)
      setError(err)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthContext: Auth state changed:', event)
      setSession(session)
      setUser(session?.user ?? null)
      setError(null)
      
      // Fetch profile when user changes - in background
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 100)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error)
        return { error }
      }
      setError(null)
      return { error: null }
    } catch (err) {
      setError(err)
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, company: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, company },
          emailRedirectTo: `${window.location.origin}/auth/login`
        },
      })
      if (error) {
        setError(error)
        return { error }
      }
      setError(null)
      return { error: null }
    } catch (err) {
      setError(err)
      return { error: err }
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      setSession(null)
      setProfile(null)
      setError(null)
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    return { error: new Error('Profile updates disabled') }
  }

  const retryAuth = () => {
    console.log('Retry auth - refreshing page...')
    window.location.reload()
  }

  const value = {
    user,
    session,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    retryAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 