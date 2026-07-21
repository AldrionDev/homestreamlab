import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api-client'
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from '@/lib/auth-storage'
import type { User } from '@/lib/auth-storage'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (accessToken: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = readStoredAuth()
    if (!stored) {
      setIsLoading(false)
      return
    }

    setUser(stored.user)

    api
      .get<User>('/auth/me')
      .then((freshUser) => {
        writeStoredAuth(stored.accessToken, freshUser)
        setUser(freshUser)
      })
      .catch(() => {
        clearStoredAuth()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  function login(accessToken: string, user: User) {
    writeStoredAuth(accessToken, user)
    setUser(user)
  }

  function logout() {
    clearStoredAuth()
    setUser(null)
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
