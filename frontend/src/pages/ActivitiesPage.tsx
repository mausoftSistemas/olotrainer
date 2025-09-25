import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ClockIcon,
  FireIcon,
  MapPinIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface Activity {
  id: string
  title: string
  type: 'running' | 'cycling' | 'swimming' | 'strength' | 'yoga' | 'other'
  date: string
  duration: number // in minutes
  distance?: number // in km
  calories?: number
  location?: string
  notes?: string
  intensity: 'low' | 'medium' | 'high'
  completed: boolean
}

interface ActivityCardProps {
  activity: Activity
  onEdit?: (activity: Activity) => void
  onDelete?: (id: string) => void
}

function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const typeIcons = {
    running: '🏃‍♂️',
    cycling: '🚴‍♂️',
    swimming: '🏊‍♂️',
    strength: '💪',
    yoga: '🧘‍♀️',
    other: '🏃‍♂️',
  }

  const intensityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  }

  const intensityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  }

  return (
    <div className={cn(
      'card p-6 transition-all duration-200 hover:shadow-lg',
      !activity.completed && 'border-l-4 border-l-primary-500'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">
            {typeIcons[activity.type]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activity.title}
            </h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>{new Date(activity.date).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{activity.duration} min</span>
              </div>
              {activity.distance && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{activity.distance} km</span>
                </div>
              )}
              {activity.calories && (
                <div className="flex items-center space-x-1">
                  <FireIcon className="h-4 w-4" />
                  <span>{activity.calories} cal</span>
                </div>
              )}
            </div>
            {activity.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                📍 {activity.location}
              </p>
            )}
            {activity.notes && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                {activity.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            intensityColors[activity.intensity]
          )}>
            {intensityLabels[activity.intensity]}
          </span>
          {activity.completed && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Completado
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit?.(activity)}
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete?.(activity.id)}
            className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 font-medium"
          >
            Eliminar
          </button>
        </div>
        {!activity.completed && (
          <button className="btn-sm btn-primary">
            Marcar como Completado
          </button>
        )}
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Mock data - replace with real API calls
  const activities: Activity[] = [
    {
      id: '1',
      title: 'Carrera Matutina',
      type: 'running',
      date: '2024-01-15',
      duration: 45,
      distance: 8.5,
      calories: 420,
      location: 'Parque Central',
      notes: 'Buen ritmo, me sentí muy bien durante toda la carrera.',
      intensity: 'medium',
      completed: true,
    },
    {
      id: '2',
      title: 'Entrenamiento de Fuerza',
      type: 'strength',
      date: '2024-01-14',
      duration: 60,
      calories: 280,
      location: 'Gimnasio',
      notes: 'Enfoque en tren superior. Aumenté peso en press de banca.',
      intensity: 'high',
      completed: true,
    },
    {
      id: '3',
      title: 'Sesión de Natación',
      type: 'swimming',
      date: '2024-01-16',
      duration: 30,
      distance: 1.5,
      calories: 200,
      location: 'Piscina Municipal',
      intensity: 'medium',
      completed: false,
    },
    {
      id: '4',
      title: 'Yoga Relajante',
      type: 'yoga',
      date: '2024-01-13',
      duration: 45,
      calories: 120,
      notes: 'Sesión de recuperación después del entrenamiento intenso.',
      intensity: 'low',
      completed: true,
    },
    {
      id: '5',
      title: 'Ciclismo de Montaña',
      type: 'cycling',
      date: '2024-01-17',
      duration: 90,
      distance: 25,
      calories: 650,
      location: 'Sierra Norte',
      intensity: 'high',
      completed: false,
    },
  ]

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || activity.type === selectedType
    const matchesIntensity = selectedIntensity === 'all' || activity.intensity === selectedIntensity
    const matchesCompleted = showCompleted || !activity.completed

    return matchesSearch && matchesType && matchesIntensity && matchesCompleted
  })

  const stats = {
    total: activities.length,
    completed: activities.filter(a => a.completed).length,
    pending: activities.filter(a => !a.completed).length,
    totalDuration: activities.reduce((sum, a) => sum + a.duration, 0),
    totalCalories: activities.reduce((sum, a) => sum + (a.calories || 0), 0),
  }

  return (
    <>
      <Helmet>
        <title>Actividades - OloTrainer</title>
        <meta name="description" content="Gestiona tus actividades de entrenamiento" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Actividades
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gestiona y realiza seguimiento de tus entrenamientos
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button className="btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Actividad
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <span className="text-white text-sm">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tiempo Total</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{Math.round(stats.totalDuration / 60)}h</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-500 rounded-lg">
                <FireIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calorías</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.totalCalories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar actividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'btn-secondary inline-flex items-center',
                showFilters && 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
              )}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtros
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Actividad
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input"
                  >
                    <option value="all">Todos</option>
                    <option value="running">Carrera</option>
                    <option value="cycling">Ciclismo</option>
                    <option value="swimming">Natación</option>
                    <option value="strength">Fuerza</option>
                    <option value="yoga">Yoga</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Intensidad
                  </label>
                  <select
                    value={selectedIntensity}
                    onChange={(e) => setSelectedIntensity(e.target.value)}
                    className="input"
                  >
                    <option value="all">Todas</option>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Mostrar completadas
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <CalendarDaysIcon className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron actividades
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedType !== 'all' || selectedIntensity !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primera actividad'
                }
              </p>
              <button className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Actividad
              </button>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={(activity) => console.log('Edit activity:', activity)}
                onDelete={(id) => console.log('Delete activity:', id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}