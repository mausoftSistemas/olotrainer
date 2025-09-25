import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// Store
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

// Components
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import ActivitiesPage from '@/pages/ActivitiesPage'
import WorkoutsPage from '@/pages/WorkoutsPage'
import MessagesPage from '@/pages/MessagesPage'
import FeedbackPage from '@/pages/FeedbackPage'
import IntegrationsPage from '@/pages/IntegrationsPage'
import AthletesPage from '@/pages/AthletesPage'
import ProgressPage from '@/pages/ProgressPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Route guards
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CoachRoute from '@/components/auth/CoachRoute'
import AthleteRoute from '@/components/auth/AthleteRoute'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const { theme, initializeTheme } = useThemeStore()

  useEffect(() => {
    // Initialize theme
    initializeTheme()
    
    // Check authentication status
    checkAuth()
  }, [initializeTheme, checkAuth])

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>OloTrainer - Plataforma de Entrenamiento Deportivo</title>
        <meta 
          name="description" 
          content="Plataforma integral para entrenadores y atletas. Gestiona entrenamientos, actividades, feedback y comunicación en un solo lugar." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <RegisterPage />
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />
            } 
          />
          <Route 
            path="/reset-password/:token" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />
            } 
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Activities */}
                    <Route path="/activities" element={<ActivitiesPage />} />
                    
                    {/* Workouts */}
                    <Route path="/workouts" element={<WorkoutsPage />} />
                    
                    {/* Messages */}
                    <Route path="/messages" element={<MessagesPage />} />
                    
                    {/* Feedback */}
                    <Route path="/feedback" element={<FeedbackPage />} />
                    
                    {/* Progress */}
                    <Route path="/progress" element={<ProgressPage />} />
                    
                    {/* Integrations */}
                    <Route path="/integrations" element={<IntegrationsPage />} />
                    
                    {/* Coach-only routes */}
                    <Route
                      path="/athletes"
                      element={
                        <CoachRoute>
                          <AthletesPage />
                        </CoachRoute>
                      }
                    />
                    
                    {/* Settings */}
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App