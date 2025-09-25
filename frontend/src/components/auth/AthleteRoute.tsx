import React from 'react'
import { useAuthStore } from '@/store/authStore'
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'

interface AthleteRouteProps {
  children: React.ReactNode
}

export default function AthleteRoute({ children }: AthleteRouteProps) {
  const { user } = useAuthStore()

  if (!user || user.role !== 'ATHLETE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-100 dark:bg-error-900/20 mb-6">
              <ShieldExclamationIcon className="h-8 w-8 text-error-600 dark:text-error-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acceso Restringido
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esta sección está disponible únicamente para atletas. 
              No tienes los permisos necesarios para acceder a este contenido.
            </p>
            
            <button
              onClick={() => window.history.back()}
              className="btn-primary w-full"
            >
              Volver Atrás
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}