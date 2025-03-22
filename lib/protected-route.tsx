"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [] 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      router.push('/signin')
      return
    }

    // If authenticated but role is not allowed, redirect to appropriate dashboard
    if (!loading && isAuthenticated && user && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.includes(user.role)
      
      if (!hasAllowedRole) {
        // Redirect based on user role
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin')
            break
          case 'SECURITY_MANAGER':
            router.push('/security-manager')
            break
          case 'DEPARTMENT_MANAGER':
            router.push('/department-manager')
            break
          case 'USER':
          default:
            router.push('/user-dashboard')
            break
        }
      }
    }
  }, [loading, isAuthenticated, user, router, allowedRoles])

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nca-dark-blue">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-nca-teal border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (will be redirected by useEffect)
  if (!isAuthenticated) {
    return null
  }

  // If role check is required and user doesn't have the required role, don't render children
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null
  }

  // If authenticated and has the required role (or no role check), render children
  return <>{children}</>
}
