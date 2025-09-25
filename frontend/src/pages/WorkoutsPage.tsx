import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
  duration?: number // in seconds
  restTime: number // in seconds
  notes?: string
}

interface Workout {
  id: string
  title: string
  description?: string
  category: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'recovery'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number // in minutes
  exercises: Exercise[]
  createdBy: string
  createdAt: string
  isTemplate: boolean
  tags: string[]
  completedCount: number
}

interface WorkoutCardProps {
  workout: Workout
  onStart?: (workout: Workout) => void
  onEdit?: (workout: Workout) => void
  onDelete?: (id: string) => void
  onDuplicate?: (workout: Workout) => void
}

function WorkoutCard({ workout, onStart, onEdit, onDelete, onDuplicate }: WorkoutCardProps) {
  const categoryIcons = {
    strength: '💪',
    cardio: '❤️',
    flexibility: '🧘‍♀️',
    sports: '⚽',
    recovery: '🛌',
  }

  const categoryLabels = {
    strength: 'Fuerza',
    cardio: 'Cardio',
    flexibility: 'Flexibilidad',
    sports: 'Deportes',
    recovery: 'Recuperación',
  }

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  }

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">
            {categoryIcons[workout.category]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {workout.title}
            </h3>
            {workout.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {workout.description}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{categoryLabels[workout.category]}</span>
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{workout.estimatedDuration} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <ChartBarIcon className="h-4 w-4" />
                <span>{workout.exercises.length} ejercicios</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            difficultyColors[workout.difficulty]
          )}>
            {difficultyLabels[workout.difficulty]}
          </span>
          {workout.isTemplate && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              Plantilla
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      {workout.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {workout.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Exercise Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ejercicios ({workout.exercises.length})
        </h4>
        <div className="space-y-1">
          {workout.exercises.slice(0, 3).map((exercise, index) => (
            <div key={exercise.id} className="text-sm text-gray-600 dark:text-gray-400">
              {index + 1}. {exercise.name} - {exercise.sets}x{exercise.reps}
              {exercise.weight && ` @ ${exercise.weight}kg`}
            </div>
          ))}
          {workout.exercises.length > 3 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              +{workout.exercises.length - 3} ejercicios más...
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <UserGroupIcon className="h-4 w-4" />
          <span>Completado {workout.completedCount} veces</span>
        </div>
        <div className="flex items-center space-x-1">
          <CalendarDaysIcon className="h-4 w-4" />
          <span>{new Date(workout.createdAt).toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit?.(workout)}
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => onDuplicate?.(workout)}
            className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 font-medium"
          >
            Duplicar
          </button>
          <button
            onClick={() => onDelete?.(workout.id)}
            className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 font-medium"
          >
            Eliminar
          </button>
        </div>
        <button
          onClick={() => onStart?.(workout)}
          className="btn-primary btn-sm inline-flex items-center"
        >
          <PlayIcon className="h-4 w-4 mr-1" />
          Iniciar
        </button>
      </div>
    </div>
  )
}

export default function WorkoutsPage() {
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false)

  // Mock data - replace with real API calls
  const workouts: Workout[] = [
    {
      id: '1',
      title: 'Entrenamiento de Fuerza Completo',
      description: 'Rutina completa para trabajar todos los grupos musculares principales',
      category: 'strength',
      difficulty: 'intermediate',
      estimatedDuration: 60,
      exercises: [
        {
          id: '1',
          name: 'Sentadillas',
          sets: 4,
          reps: 12,
          weight: 80,
          restTime: 90,
          notes: 'Mantener la espalda recta'
        },
        {
          id: '2',
          name: 'Press de Banca',
          sets: 4,
          reps: 10,
          weight: 70,
          restTime: 120,
        },
        {
          id: '3',
          name: 'Peso Muerto',
          sets: 3,
          reps: 8,
          weight: 100,
          restTime: 180,
        },
        {
          id: '4',
          name: 'Dominadas',
          sets: 3,
          reps: 8,
          restTime: 120,
        },
      ],
      createdBy: 'coach1',
      createdAt: '2024-01-10',
      isTemplate: true,
      tags: ['fuerza', 'completo', 'intermedio'],
      completedCount: 15,
    },
    {
      id: '2',
      title: 'HIIT Cardio Intenso',
      description: 'Entrenamiento de alta intensidad para quemar grasa',
      category: 'cardio',
      difficulty: 'advanced',
      estimatedDuration: 30,
      exercises: [
        {
          id: '5',
          name: 'Burpees',
          sets: 4,
          reps: 15,
          restTime: 30,
        },
        {
          id: '6',
          name: 'Mountain Climbers',
          sets: 4,
          duration: 30,
          restTime: 30,
        },
        {
          id: '7',
          name: 'Jump Squats',
          sets: 4,
          reps: 20,
          restTime: 30,
        },
      ],
      createdBy: 'coach1',
      createdAt: '2024-01-12',
      isTemplate: true,
      tags: ['hiit', 'cardio', 'quemar-grasa'],
      completedCount: 8,
    },
    {
      id: '3',
      title: 'Yoga Matutino',
      description: 'Secuencia suave para empezar el día con energía',
      category: 'flexibility',
      difficulty: 'beginner',
      estimatedDuration: 20,
      exercises: [
        {
          id: '8',
          name: 'Saludo al Sol',
          sets: 3,
          reps: 1,
          restTime: 10,
        },
        {
          id: '9',
          name: 'Postura del Guerrero',
          sets: 2,
          duration: 60,
          restTime: 15,
        },
      ],
      createdBy: 'user1',
      createdAt: '2024-01-14',
      isTemplate: false,
      tags: ['yoga', 'mañana', 'flexibilidad'],
      completedCount: 3,
    },
  ]

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || workout.difficulty === selectedDifficulty
    const matchesTemplate = !showTemplatesOnly || workout.isTemplate

    return matchesSearch && matchesCategory && matchesDifficulty && matchesTemplate
  })

  const stats = {
    total: workouts.length,
    templates: workouts.filter(w => w.isTemplate).length,
    completed: workouts.reduce((sum, w) => sum + w.completedCount, 0),
    avgDuration: Math.round(workouts.reduce((sum, w) => sum + w.estimatedDuration, 0) / workouts.length),
  }

  return (
    <>
      <Helmet>
        <title>Entrenamientos - OloTrainer</title>
        <meta name="description" content="Gestiona tus rutinas de entrenamiento" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Entrenamientos
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Crea y gestiona tus rutinas de entrenamiento
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="btn-secondary inline-flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Estadísticas
            </button>
            <button className="btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Entrenamiento
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="p-2 bg-purple-500 rounded-lg">
                <span className="text-white text-sm">📋</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plantillas</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.templates}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completados</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duración Prom.</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.avgDuration}min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar entrenamientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">Todas las categorías</option>
                <option value="strength">Fuerza</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibilidad</option>
                <option value="sports">Deportes</option>
                <option value="recovery">Recuperación</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input"
              >
                <option value="all">Todas las dificultades</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTemplatesOnly}
                onChange={(e) => setShowTemplatesOnly(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Solo mostrar plantillas
              </span>
            </label>
          </div>
        </div>

        {/* Workouts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWorkouts.length === 0 ? (
            <div className="lg:col-span-2 card p-8 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <ChartBarIcon className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron entrenamientos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primer entrenamiento'
                }
              </p>
              <button className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Entrenamiento
              </button>
            </div>
          ) : (
            filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onStart={(workout) => console.log('Start workout:', workout)}
                onEdit={(workout) => console.log('Edit workout:', workout)}
                onDelete={(id) => console.log('Delete workout:', id)}
                onDuplicate={(workout) => console.log('Duplicate workout:', workout)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}