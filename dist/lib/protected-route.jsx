"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
export default function ProtectedRoute(_a) {
    var children = _a.children, _b = _a.allowedRoles, allowedRoles = _b === void 0 ? [] : _b;
    var _c = useAuth(), user = _c.user, loading = _c.loading, isAuthenticated = _c.isAuthenticated;
    var router = useRouter();
    // Check if authentication is enabled
    var isAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH !== 'false';
    // Always call useEffect to comply with React Hooks rules
    useEffect(function () {
        // Skip authentication checks if auth is disabled
        if (!isAuthEnabled) {
            return;
        }
        // If not loading and not authenticated, redirect to login
        if (!loading && !isAuthenticated) {
            router.push('/signin');
            return;
        }
        // If authenticated but role is not allowed, redirect to appropriate dashboard
        if (!loading && isAuthenticated && user && allowedRoles.length > 0) {
            var hasAllowedRole = allowedRoles.includes(user.role);
            if (!hasAllowedRole) {
                // Redirect based on user role
                switch (user.role) {
                    case 'ADMIN':
                        router.push('/admin');
                        break;
                    case 'SECURITY_MANAGER':
                        router.push('/security-manager');
                        break;
                    case 'DEPARTMENT_MANAGER':
                        router.push('/department-manager');
                        break;
                    case 'USER':
                    default:
                        router.push('/user-dashboard');
                        break;
                }
            }
        }
    }, [loading, isAuthenticated, user, router, allowedRoles, isAuthEnabled]);
    // If authentication is disabled, render children directly
    if (!isAuthEnabled) {
        return <>{children}</>;
    }
    // Show loading state
    if (loading) {
        return (<div className="flex min-h-screen items-center justify-center bg-nca-dark-blue">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-nca-teal border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white">جاري التحميل...</p>
        </div>
      </div>);
    }
    // If not authenticated, don't render children (will be redirected by useEffect)
    if (!isAuthenticated) {
        return null;
    }
    // If role check is required and user doesn't have the required role, don't render children
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return null;
    }
    // If authenticated and has the required role (or no role check), render children
    return <>{children}</>;
}
