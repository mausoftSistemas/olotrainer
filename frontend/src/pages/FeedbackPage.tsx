import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  StarIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface Feedback {
  id: string;
  athleteId: string;
  athleteName: string;
  athleteAvatar?: string;
  coachId: string;
  coachName: string;
  title: string;
  content: string;
  rating: number;
  category: 'performance' | 'technique' | 'attitude' | 'progress' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'sent' | 'read' | 'acknowledged';
  createdAt: Date;
  updatedAt: Date;
  workoutId?: string;
  workoutTitle?: string;
  tags: string[];
  isPrivate: boolean;
}

const FeedbackPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewFeedbackModal, setShowNewFeedbackModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - En producción esto vendría de la API
  const [feedbacks] = useState<Feedback[]>([
    {
      id: '1',
      athleteId: '2',
      athleteName: 'Carlos Rodríguez',
      athleteAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      coachId: user?.id || '1',
      coachName: user?.firstName + ' ' + user?.lastName || 'Entrenador',
      title: 'Excelente progreso en fuerza',
      content: 'Carlos ha mostrado una mejora significativa en sus levantamientos. Su técnica en sentadillas ha mejorado notablemente y está manejando pesos más altos con buena forma. Recomiendo continuar con el programa actual y agregar trabajo de movilidad.',
      rating: 5,
      category: 'performance',
      priority: 'high',
      status: 'sent',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      workoutId: 'w1',
      workoutTitle: 'Entrenamiento de Fuerza - Semana 4',
      tags: ['fuerza', 'técnica', 'progreso'],
      isPrivate: false
    },
    {
      id: '2',
      athleteId: '3',
      athleteName: 'Ana García',
      athleteAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      coachId: user?.id || '1',
      coachName: user?.firstName + ' ' + user?.lastName || 'Entrenador',
      title: 'Mejorar consistencia en entrenamientos',
      content: 'Ana tiene un gran potencial, pero necesita trabajar en la consistencia. Ha faltado a varios entrenamientos esta semana. Sería bueno hablar sobre su horario y encontrar una rutina que pueda mantener.',
      rating: 3,
      category: 'attitude',
      priority: 'medium',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      tags: ['consistencia', 'asistencia'],
      isPrivate: true
    },
    {
      id: '3',
      athleteId: '4',
      athleteName: 'Miguel Torres',
      athleteAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      coachId: user?.id || '1',
      coachName: user?.firstName + ' ' + user?.lastName || 'Entrenador',
      title: 'Técnica de carrera mejorada',
      content: 'Miguel ha trabajado duro en mejorar su técnica de carrera. Su cadencia ha mejorado y está corriendo de manera más eficiente. Excelente trabajo en los ejercicios de forma que hemos estado practicando.',
      rating: 4,
      category: 'technique',
      priority: 'low',
      status: 'acknowledged',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      workoutId: 'w2',
      workoutTitle: 'Entrenamiento de Carrera - Técnica',
      tags: ['carrera', 'técnica', 'eficiencia'],
      isPrivate: false
    }
  ]);

  const categories = [
    { value: 'performance', label: 'Rendimiento', icon: TrophyIcon, color: 'text-yellow-600' },
    { value: 'technique', label: 'Técnica', icon: CheckCircleIcon, color: 'text-blue-600' },
    { value: 'attitude', label: 'Actitud', icon: UserIcon, color: 'text-green-600' },
    { value: 'progress', label: 'Progreso', icon: ClockIcon, color: 'text-purple-600' },
    { value: 'general', label: 'General', icon: ChatBubbleLeftRightIcon, color: 'text-gray-600' }
  ];

  const priorities = [
    { value: 'low', label: 'Baja', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  ];

  const statuses = [
    { value: 'draft', label: 'Borrador', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
    { value: 'sent', label: 'Enviado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { value: 'read', label: 'Leído', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { value: 'acknowledged', label: 'Confirmado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
  ];

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || feedback.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || feedback.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const selectedFeedbackData = feedbacks.find(f => f.id === selectedFeedback);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[4];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[0];
  };

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < rating ? (
          <StarIconSolid className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        )}
      </span>
    ));
  };

  const FeedbackCard: React.FC<{ feedback: Feedback }> = ({ feedback }) => {
    const categoryInfo = getCategoryInfo(feedback.category);
    const priorityInfo = getPriorityInfo(feedback.priority);
    const statusInfo = getStatusInfo(feedback.status);
    const CategoryIcon = categoryInfo.icon;

    return (
      <div
        onClick={() => setSelectedFeedback(feedback.id)}
        className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:shadow-md transition-all ${
          selectedFeedback === feedback.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <img
              src={feedback.athleteAvatar || `https://ui-avatars.com/api/?name=${feedback.athleteName}&background=3b82f6&color=fff`}
              alt={feedback.athleteName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900 dark:text-white">{feedback.athleteName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(feedback.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CategoryIcon className={`w-5 h-5 ${categoryInfo.color}`} />
            {feedback.isPrivate && (
              <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" title="Feedback privado" />
            )}
          </div>
        </div>

        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{feedback.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{feedback.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {renderStars(feedback.rating)}
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityInfo.color}`}>
              {priorityInfo.label}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {feedback.workoutTitle && (
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            📋 {feedback.workoutTitle}
          </div>
        )}

        {feedback.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {feedback.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Feedback - OloTrainer</title>
        <meta name="description" content="Sistema de feedback para entrenadores y atletas" />
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role === 'COACH' ? 'Gestiona el feedback para tus atletas' : 'Revisa el feedback de tu entrenador'}
            </p>
          </div>
          {user?.role === 'COACH' && (
            <button
              onClick={() => setShowNewFeedbackModal(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nuevo Feedback
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{feedbacks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {feedbacks.filter(f => f.status === 'acknowledged').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alta Prioridad</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {feedbacks.filter(f => f.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de feedback */}
          <div className="lg:col-span-2">
            {/* Filtros y búsqueda */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Feedback ({filteredFeedbacks.length})
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Filtros
                </button>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtros */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las categorías</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioridad
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las prioridades</option>
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de feedback */}
            <div className="space-y-4">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <FeedbackCard key={feedback.id} feedback={feedback} />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No se encontró feedback
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No hay feedback que coincida con los filtros seleccionados.
                  </p>
                  {user?.role === 'COACH' && (
                    <button
                      onClick={() => setShowNewFeedbackModal(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Crear Nuevo Feedback
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel de detalles */}
          <div className="lg:col-span-1">
            {selectedFeedbackData ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detalles del Feedback
                  </h3>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <img
                      src={selectedFeedbackData.athleteAvatar || `https://ui-avatars.com/api/?name=${selectedFeedbackData.athleteName}&background=3b82f6&color=fff`}
                      alt={selectedFeedbackData.athleteName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {selectedFeedbackData.athleteName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(selectedFeedbackData.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      {selectedFeedbackData.title}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {selectedFeedbackData.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating:</span>
                    <div className="flex items-center">
                      {renderStars(selectedFeedbackData.rating)}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {selectedFeedbackData.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getCategoryInfo(selectedFeedbackData.category).label}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getPriorityInfo(selectedFeedbackData.priority).label}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusInfo(selectedFeedbackData.status).color}`}>
                      {getStatusInfo(selectedFeedbackData.status).label}
                    </span>
                  </div>

                  {selectedFeedbackData.workoutTitle && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Entrenamiento:</span>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {selectedFeedbackData.workoutTitle}
                      </p>
                    </div>
                  )}

                  {selectedFeedbackData.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedFeedbackData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {user?.role === 'COACH' && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-2">
                        Editar Feedback
                      </button>
                      <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecciona un feedback
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Haz clic en un feedback de la lista para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;