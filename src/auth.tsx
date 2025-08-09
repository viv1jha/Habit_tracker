import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, googleProvider, calendarScope } from './firebase'
import type { User } from 'firebase/auth'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  signInAnonymously,
} from 'firebase/auth'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  accessToken?: string
  signUpEmail: (email: string, password: string) => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signInGoogle: (withCalendarScope?: boolean) => Promise<void>
  connectCalendar: () => Promise<void>
  signOut: () => Promise<void>
  signInGuest: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | undefined>()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signUpEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }
  const signInEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }
  const signInGoogle = async (withCalendar?: boolean) => {
    if (withCalendar) {
      googleProvider.addScope(calendarScope)
      googleProvider.setCustomParameters({ prompt: 'consent' })
    }
    const cred = await signInWithPopup(auth, googleProvider)
    const token = GoogleAuthProvider.credentialFromResult(cred)?.accessToken
    if (token) setAccessToken(token)
  }
  const connectCalendar = async () => {
    // reauthenticate with calendar scope
    googleProvider.addScope(calendarScope)
    googleProvider.setCustomParameters({ prompt: 'consent' })
    const cred = await signInWithPopup(auth, googleProvider)
    const token = GoogleAuthProvider.credentialFromResult(cred)?.accessToken
    if (token) setAccessToken(token)
  }
  const doSignOut = async () => {
    await signOut(auth)
    setAccessToken(undefined)
  }
  const signInGuest = async () => {
    await signInAnonymously(auth)
  }

  const value: AuthContextValue = useMemo(
    () => ({ user, loading, accessToken, signUpEmail, signInEmail, signInGoogle, connectCalendar, signOut: doSignOut, signInGuest }),
    [user, loading, accessToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
