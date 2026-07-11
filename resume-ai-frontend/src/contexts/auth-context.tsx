"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { authApi } from "@/lib/api"

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const storedToken = localStorage.getItem("token")
      if (storedToken && mounted) {
        setToken(storedToken)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session && mounted) {
            const res = await authApi.me()
            if (mounted) setUser(res.user)
          } else if (mounted) {
            localStorage.removeItem("token")
            setToken(null)
          }
        } catch {
          if (mounted) {
            localStorage.removeItem("token")
            setToken(null)
          }
        }
      }
      if (mounted) setIsLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (session?.access_token) {
        localStorage.setItem("token", session.access_token)
        setToken(session.access_token)
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const res = await authApi.login({ email, password })
      localStorage.setItem("token", res.token)
      setToken(res.token)
      setUser(res.user)
      return
    }
    const accessToken = data.session.access_token
    localStorage.setItem("token", accessToken)
    setToken(accessToken)
    const res = await authApi.me()
    setUser(res.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password })
    localStorage.setItem("token", res.token)
    setToken(res.token)
    setUser(res.user)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
