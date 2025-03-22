"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@prisma/client'

// Define the shape of our context
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
})

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a user in localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'حدث خطأ أثناء تسجيل الدخول',
        }
      }

      // Store user in state and localStorage
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول',
      }
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // Determine if user is authenticated
  const isAuthenticated = !!user

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
