import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
    
    // Log error to monitoring service (e.g., Sentry)
    if (import.meta.env.PROD) {
      // logErrorToService(error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-100 dark:bg-error-900/20 mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-error-600 dark:text-error-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Oops! Algo salió mal
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado 
                y está trabajando para solucionarlo.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Error Details (Development):
                  </h3>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full btn-primary"
                >
                  Recargar página
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full btn-secondary"
                >
                  Ir al inicio
                </button>
              </div>

              <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                Si el problema persiste, contacta con soporte técnico.
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary