import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page with return url
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Check if user account is active
  if (!user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-warning-100 dark:bg-warning-900/20 mb-6">
              <svg className="h-8 w-8 text-warning-600 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cuenta Desactivada
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu cuenta ha sido desactivada. Contacta con el administrador para más información.
            </p>
            
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="btn-primary w-full"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}