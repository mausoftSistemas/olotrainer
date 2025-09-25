import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  ClockIcon,
  FireIcon,
  HeartIcon,
  BoltIcon,
  ScaleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ShareIcon,
  PrinterIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

interface ProgressMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  target?: number;
  category: 'performance' | 'health' | 'body' | 'training';
}

interface WorkoutProgress {
  id: string;
  date: Date;
  type: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  calories: number;
  heartRate?: {
    avg: number;
    max: number;
  };
  notes?: string;
  rating: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'personal_record' | 'milestone' | 'consistency' | 'improvement';
  icon: string;
  value?: string;
}

const ProgressPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - En producción esto vendría de la API
  const [metrics] = useState<ProgressMetric[]>([
    {
      id: '1',
      name: 'Peso Corporal',
      value: 72.5,
      unit: 'kg',
      change: -2.3,
      changeType: 'decrease',
      icon: ScaleIcon,
      color: 'text-blue-600',
      target: 70,
      category: 'body'
    },
    {
      id: '2',
      name: 'Frecuencia Cardíaca en Reposo',
      value: 58,
      unit: 'bpm',
      change: -5,
      changeType: 'decrease',
      icon: HeartIcon,
      color: 'text-red-600',
      category: 'health'
    },
    {
      id: '3',
      name: 'VO2 Máximo',
      value: 52.3,
      unit: 'ml/kg/min',
      change: 3.2,
      changeType: 'increase',
      icon: BoltIcon,
      color: 'text-green-600',
      category: 'performance'
    },
    {
      id: '4',
      name: 'Tiempo 5K',
      value: 22.45,
      unit: 'min',
      change: -1.15,
      changeType: 'decrease',
      icon: ClockIcon,
      color: 'text-purple-600',
      category: 'performance'
    },
    {
      id: '5',
      name: 'Entrenamientos por Semana',
      value: 4.2,
      unit: 'sesiones',
      change: 0.8,
      changeType: 'increase',
      icon: CalendarIcon,
      color: 'text-orange-600',
      category: 'training'
    },
    {
      id: '6',
      name: 'Calorías Quemadas',
      value: 2850,
      unit: 'kcal/semana',
      change: 320,
      changeType: 'increase',
      icon: FireIcon,
      color: 'text-yellow-600',
      category: 'training'
    }
  ]);

  const [workoutHistory] = useState<WorkoutProgress[]>([
    {
      id: '1',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: 'Running',
      duration: 45,
      intensity: 'medium',
      calories: 420,
      heartRate: { avg: 145, max: 165 },
      rating: 4,
      notes: 'Buen ritmo, me sentí fuerte'
    },
    {
      id: '2',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      type: 'Strength Training',
      duration: 60,
      intensity: 'high',
      calories: 380,
      heartRate: { avg: 120, max: 155 },
      rating: 5,
      notes: 'Nuevo PR en sentadillas!'
    },
    {
      id: '3',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      type: 'Cycling',
      duration: 90,
      intensity: 'medium',
      calories: 650,
      heartRate: { avg: 135, max: 160 },
      rating: 4
    },
    {
      id: '4',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      type: 'Swimming',
      duration: 40,
      intensity: 'high',
      calories: 320,
      rating: 3,
      notes: 'Técnica de brazada necesita trabajo'
    },
    {
      id: '5',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      type: 'Running',
      duration: 35,
      intensity: 'low',
      calories: 280,
      heartRate: { avg: 125, max: 140 },
      rating: 4,
      notes: 'Recuperación activa'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Nuevo Récord Personal',
      description: 'Mejor tiempo en 5K: 22:45',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      type: 'personal_record',
      icon: '🏆',
      value: '22:45'
    },
    {
      id: '2',
      title: 'Racha de Consistencia',
      description: '15 días consecutivos entrenando',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      type: 'consistency',
      icon: '🔥'
    },
    {
      id: '3',
      title: 'Objetivo de Peso Alcanzado',
      description: 'Has perdido 5kg en 3 meses',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      type: 'milestone',
      icon: '🎯',
      value: '-5kg'
    },
    {
      id: '4',
      title: 'Mejora en VO2 Máximo',
      description: 'Incremento del 8% en capacidad aeróbica',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      type: 'improvement',
      icon: '📈',
      value: '+8%'
    }
  ]);

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'performance', label: 'Rendimiento' },
    { value: 'health', label: 'Salud' },
    { value: 'body', label: 'Composición Corporal' },
    { value: 'training', label: 'Entrenamiento' }
  ];

  const periods = [
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Últimos 3 meses' },
    { value: 'year', label: 'Este año' }
  ];

  const intensityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const intensityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const MetricCard: React.FC<{ metric: ProgressMetric }> = ({ metric }) => {
    const Icon = metric.icon;
    const isPositiveChange = metric.changeType === 'increase';
    const isNegativeChange = metric.changeType === 'decrease';
    
    // Para métricas como peso y tiempo, una disminución puede ser positiva
    const isGoodChange = (metric.name.includes('Peso') || metric.name.includes('Tiempo')) 
      ? isNegativeChange 
      : isPositiveChange;

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${metric.color.includes('blue') ? 'bg-blue-100 dark:bg-blue-900' : 
                                          metric.color.includes('red') ? 'bg-red-100 dark:bg-red-900' :
                                          metric.color.includes('green') ? 'bg-green-100 dark:bg-green-900' :
                                          metric.color.includes('purple') ? 'bg-purple-100 dark:bg-purple-900' :
                                          metric.color.includes('orange') ? 'bg-orange-100 dark:bg-orange-900' :
                                          'bg-yellow-100 dark:bg-yellow-900'}`}>
            <Icon className={`w-6 h-6 ${metric.color}`} />
          </div>
          
          {metric.change !== 0 && (
            <div className={`flex items-center text-sm font-medium ${
              isGoodChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isPositiveChange ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(metric.change)}{metric.unit === 'min' ? 'min' : metric.unit === 'kg' ? 'kg' : ''}
            </div>
          )}
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {metric.name}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metric.value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
          </p>
        </div>

        {metric.target && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Objetivo: {metric.target}{metric.unit}</span>
              <span>{Math.round((metric.value / metric.target) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const WorkoutCard: React.FC<{ workout: WorkoutProgress }> = ({ workout }) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{workout.type}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(workout.date)}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${intensityColors[workout.intensity]}`}>
            {intensityLabels[workout.intensity]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Duración</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatTime(workout.duration)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Calorías</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {workout.calories}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < workout.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {workout.heartRate && (
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">FC Promedio</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {workout.heartRate.avg} bpm
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">FC Máxima</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {workout.heartRate.max} bpm
              </p>
            </div>
          </div>
        )}

        {workout.notes && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
            {workout.notes}
          </div>
        )}
      </div>
    );
  };

  const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="text-2xl mr-3">{achievement.icon}</div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {achievement.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {achievement.description}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(achievement.date)}
              </p>
              {achievement.value && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  {achievement.value}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Progreso - OloTrainer</title>
        <meta name="description" content="Visualiza tu progreso y evolución en el entrenamiento" />
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progreso</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Visualiza tu evolución y logros
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ShareIcon className="w-4 h-4 mr-2" />
              Compartir
            </button>
            <button className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <PrinterIcon className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {periods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Métricas principales */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Métricas Clave
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Historial de entrenamientos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Entrenamientos Recientes
              </h2>
              <button className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                <EyeIcon className="w-4 h-4 mr-1" />
                Ver todos
              </button>
            </div>
            
            <div className="space-y-4">
              {workoutHistory.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          </div>

          {/* Logros y achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Logros Recientes
              </h2>
              <button className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                <TrophyIcon className="w-4 h-4 mr-1" />
                Ver todos
              </button>
            </div>
            
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de progreso placeholder */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Evolución del Rendimiento
          </h2>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Gráfico de Progreso</p>
                <p className="text-sm">
                  Aquí se mostrará un gráfico interactivo con tu evolución a lo largo del tiempo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgressPage;