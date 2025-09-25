import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Página No Encontrada - OloTrainer</title>
        <meta name="description" content="La página que buscas no existe" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            {/* 404 Illustration */}
            <div className="mx-auto h-32 w-32 text-primary-600 dark:text-primary-400 mb-8">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Página No Encontrada
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Lo sentimos, la página que estás buscando no existe o ha sido movida a otra ubicación.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/dashboard"
                className="btn-primary inline-flex items-center px-6 py-3"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Ir al Dashboard
              </Link>
              <button
                onClick={() => window.history.back()}
                className="btn-secondary inline-flex items-center px-6 py-3"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver Atrás
              </button>
            </div>

            {/* Help Section */}
            <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                ¿Necesitas ayuda?
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Si llegaste aquí siguiendo un enlace, es posible que esté roto o desactualizado.
                </p>
                <p>
                  Puedes intentar:
                </p>
                <ul className="list-disc list-inside space-y-1 text-left max-w-sm mx-auto">
                  <li>Verificar la URL en la barra de direcciones</li>
                  <li>Usar el menú de navegación para encontrar lo que buscas</li>
                  <li>Contactar a nuestro equipo de soporte si el problema persiste</li>
                </ul>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href="mailto:support@olotrainer.com"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
                >
                  Contactar Soporte →
                </a>
              </div>
            </div>

            {/* Popular Links */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Enlaces Populares
              </h4>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  to="/dashboard"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Dashboard
                </Link>
                <Link
                  to="/activities"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Actividades
                </Link>
                <Link
                  to="/workouts"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Entrenamientos
                </Link>
                <Link
                  to="/profile"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Perfil
                </Link>
                <Link
                  to="/settings"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Configuración
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}