import React from 'react'
import { Helmet } from 'react-helmet-async'
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  FireIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}

function StatCard({ title, value, change, icon: Icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  }

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </div>
              {change && (
                <div className={cn(
                  'ml-2 flex items-baseline text-sm font-semibold',
                  change.type === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {change.type === 'increase' ? (
                    <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {change.type === 'increase' ? 'Increased' : 'Decreased'} by
                  </span>
                  {Math.abs(change.value)}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

interface ActivityItemProps {
  title: string
  description: string
  time: string
  type: 'workout' | 'message' | 'achievement' | 'reminder'
}

function ActivityItem({ title, description, time, type }: ActivityItemProps) {
  const typeIcons = {
    workout: FireIcon,
    message: UserGroupIcon,
    achievement: TrophyIcon,
    reminder: ClockIcon,
  }

  const typeColors = {
    workout: 'text-red-500',
    message: 'text-blue-500',
    achievement: 'text-yellow-500',
    reminder: 'text-purple-500',
  }

  const Icon = typeIcons[type]

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <Icon className={cn('h-5 w-5', typeColors[type])} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {time}
        </span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isCoach = user?.role === 'COACH'

  // Mock data - replace with real API calls
  const coachStats = [
    {
      title: 'Atletas Activos',
      value: 24,
      change: { value: 12, type: 'increase' as const },
      icon: UserGroupIcon,
      color: 'blue' as const,
    },
    {
      title: 'Entrenamientos Esta Semana',
      value: 156,
      change: { value: 8, type: 'increase' as const },
      icon: CalendarDaysIcon,
      color: 'green' as const,
    },
    {
      title: 'Promedio de Rendimiento',
      value: '87%',
      change: { value: 3, type: 'increase' as const },
      icon: ChartBarIcon,
      color: 'purple' as const,
    },
    {
      title: 'Logros Desbloqueados',
      value: 42,
      change: { value: 15, type: 'increase' as const },
      icon: TrophyIcon,
      color: 'yellow' as const,
    },
  ]

  const athleteStats = [
    {
      title: 'Entrenamientos Completados',
      value: 28,
      change: { value: 12, type: 'increase' as const },
      icon: CalendarDaysIcon,
      color: 'green' as const,
    },
    {
      title: 'Horas de Entrenamiento',
      value: '42h',
      change: { value: 8, type: 'increase' as const },
      icon: ClockIcon,
      color: 'blue' as const,
    },
    {
      title: 'Rendimiento Promedio',
      value: '92%',
      change: { value: 5, type: 'increase' as const },
      icon: ChartBarIcon,
      color: 'purple' as const,
    },
    {
      title: 'Logros Obtenidos',
      value: 15,
      change: { value: 25, type: 'increase' as const },
      icon: TrophyIcon,
      color: 'yellow' as const,
    },
  ]

  const recentActivities = [
    {
      title: 'Entrenamiento de Resistencia Completado',
      description: 'Sesión de 45 minutos con intensidad alta',
      time: 'Hace 2 horas',
      type: 'workout' as const,
    },
    {
      title: 'Nuevo Mensaje del Entrenador',
      description: 'Revisión del plan de entrenamiento semanal',
      time: 'Hace 4 horas',
      type: 'message' as const,
    },
    {
      title: '¡Logro Desbloqueado!',
      description: 'Completaste 30 días consecutivos de entrenamiento',
      time: 'Hace 1 día',
      type: 'achievement' as const,
    },
    {
      title: 'Recordatorio: Entrenamiento Programado',
      description: 'Sesión de fuerza programada para mañana a las 8:00 AM',
      time: 'Hace 1 día',
      type: 'reminder' as const,
    },
  ]

  const stats = isCoach ? coachStats : athleteStats

  return (
    <>
      <Helmet>
        <title>Dashboard - OloTrainer</title>
        <meta name="description" content="Panel principal de OloTrainer" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ¡Bienvenido de vuelta, {user?.firstName}!
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isCoach 
              ? 'Aquí tienes un resumen de la actividad de tus atletas'
              : 'Aquí tienes un resumen de tu progreso de entrenamiento'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {isCoach ? 'Rendimiento de Atletas' : 'Tu Progreso'}
                </h3>
                <select className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>Últimos 7 días</option>
                  <option>Últimos 30 días</option>
                  <option>Últimos 3 meses</option>
                </select>
              </div>
              
              {/* Placeholder for chart */}
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Gráfico de rendimiento
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Los datos se cargarán aquí
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Actividad Reciente
            </h3>
            <div className="space-y-1">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
                Ver toda la actividad →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isCoach ? (
              <>
                <button className="btn-primary text-center p-4">
                  <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
                  Gestionar Atletas
                </button>
                <button className="btn-secondary text-center p-4">
                  <CalendarDaysIcon className="h-6 w-6 mx-auto mb-2" />
                  Crear Entrenamiento
                </button>
                <button className="btn-secondary text-center p-4">
                  <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
                  Ver Reportes
                </button>
                <button className="btn-secondary text-center p-4">
                  <FireIcon className="h-6 w-6 mx-auto mb-2" />
                  Enviar Feedback
                </button>
              </>
            ) : (
              <>
                <button className="btn-primary text-center p-4">
                  <CalendarDaysIcon className="h-6 w-6 mx-auto mb-2" />
                  Nuevo Entrenamiento
                </button>
                <button className="btn-secondary text-center p-4">
                  <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
                  Ver Progreso
                </button>
                <button className="btn-secondary text-center p-4">
                  <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
                  Contactar Entrenador
                </button>
                <button className="btn-secondary text-center p-4">
                  <TrophyIcon className="h-6 w-6 mx-auto mb-2" />
                  Ver Logros
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Próximos Eventos
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Entrenamiento de Fuerza
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Mañana a las 8:00 AM
                  </p>
                </div>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                En 18 horas
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Sesión de Cardio
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Viernes a las 6:00 PM
                  </p>
                </div>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                En 3 días
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}