import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  TrophyIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth: Date;
  sport: string;
  specialization?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: Date;
  lastActivity?: Date;
  location?: string;
  goals: string[];
  stats: {
    totalWorkouts: number;
    completedWorkouts: number;
    totalHours: number;
    averageRating: number;
  };
  currentProgram?: string;
  nextSession?: Date;
  notes?: string;
}

const AthletesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - En producción esto vendría de la API
  const [athletes] = useState<Athlete[]>([
    {
      id: '1',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+34 666 123 456',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
      dateOfBirth: new Date('1995-03-15'),
      sport: 'Running',
      specialization: 'Maratón',
      level: 'advanced',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
      location: 'Madrid, España',
      goals: ['Mejorar tiempo en maratón', 'Aumentar resistencia', 'Prevenir lesiones'],
      stats: {
        totalWorkouts: 45,
        completedWorkouts: 42,
        totalHours: 120,
        averageRating: 4.5
      },
      currentProgram: 'Plan Maratón 16 semanas',
      nextSession: new Date(Date.now() + 1000 * 60 * 60 * 24),
      notes: 'Atleta muy comprometido. Historial de lesión en rodilla izquierda.'
    },
    {
      id: '2',
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana.garcia@email.com',
      phone: '+34 677 234 567',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
      dateOfBirth: new Date('1992-07-22'),
      sport: 'Fitness',
      specialization: 'Fuerza',
      level: 'intermediate',
      status: 'active',
      joinedAt: new Date('2024-02-01'),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
      location: 'Barcelona, España',
      goals: ['Aumentar masa muscular', 'Mejorar técnica', 'Competir en powerlifting'],
      stats: {
        totalWorkouts: 32,
        completedWorkouts: 28,
        totalHours: 85,
        averageRating: 4.2
      },
      currentProgram: 'Programa Fuerza Intermedio',
      nextSession: new Date(Date.now() + 1000 * 60 * 60 * 48),
      notes: 'Progreso excelente en sentadillas. Necesita trabajar más el press de banca.'
    },
    {
      id: '3',
      firstName: 'Miguel',
      lastName: 'Torres',
      email: 'miguel.torres@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
      dateOfBirth: new Date('1998-11-08'),
      sport: 'Ciclismo',
      specialization: 'Ruta',
      level: 'beginner',
      status: 'active',
      joinedAt: new Date('2024-03-10'),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 72),
      location: 'Valencia, España',
      goals: ['Completar primera gran fondo', 'Mejorar resistencia', 'Aprender técnica'],
      stats: {
        totalWorkouts: 18,
        completedWorkouts: 15,
        totalHours: 42,
        averageRating: 3.8
      },
      currentProgram: 'Iniciación al Ciclismo',
      nextSession: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      notes: 'Muy motivado pero necesita mejorar la constancia en los entrenamientos.'
    },
    {
      id: '4',
      firstName: 'Laura',
      lastName: 'Martín',
      email: 'laura.martin@email.com',
      phone: '+34 688 345 678',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
      dateOfBirth: new Date('1990-05-12'),
      sport: 'Natación',
      specialization: 'Aguas abiertas',
      level: 'professional',
      status: 'active',
      joinedAt: new Date('2023-11-20'),
      lastActivity: new Date(Date.now() - 1000 * 60 * 30),
      location: 'Sevilla, España',
      goals: ['Clasificar para campeonato nacional', 'Mejorar técnica de brazada', 'Optimizar nutrición'],
      stats: {
        totalWorkouts: 78,
        completedWorkouts: 76,
        totalHours: 195,
        averageRating: 4.8
      },
      currentProgram: 'Preparación Competición Elite',
      nextSession: new Date(Date.now() + 1000 * 60 * 60 * 12),
      notes: 'Atleta de élite. Preparación para campeonato nacional en 3 meses.'
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'López',
      email: 'david.lopez@email.com',
      dateOfBirth: new Date('1993-09-30'),
      sport: 'CrossFit',
      level: 'intermediate',
      status: 'inactive',
      joinedAt: new Date('2024-01-05'),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      location: 'Bilbao, España',
      goals: ['Volver a entrenar', 'Recuperar forma física'],
      stats: {
        totalWorkouts: 25,
        completedWorkouts: 20,
        totalHours: 58,
        averageRating: 3.5
      },
      notes: 'Inactivo por lesión. Pendiente de alta médica.'
    }
  ]);

  const sports = ['Running', 'Fitness', 'Ciclismo', 'Natación', 'CrossFit', 'Tenis', 'Fútbol'];
  const levels = [
    { value: 'beginner', label: 'Principiante', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'intermediate', label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'advanced', label: 'Avanzado', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { value: 'professional', label: 'Profesional', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
  ];

  const statuses = [
    { value: 'active', label: 'Activo', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircleIcon },
    { value: 'inactive', label: 'Inactivo', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: ClockIcon },
    { value: 'suspended', label: 'Suspendido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: ExclamationTriangleIcon }
  ];

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = `${athlete.firstName} ${athlete.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || athlete.sport === sportFilter;
    const matchesLevel = levelFilter === 'all' || athlete.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || athlete.status === statusFilter;
    
    return matchesSearch && matchesSport && matchesLevel && matchesStatus;
  });

  const selectedAthleteData = athletes.find(a => a.id === selectedAthlete);

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelInfo = (level: string) => {
    return levels.find(l => l.value === level) || levels[0];
  };

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const AthleteCard: React.FC<{ athlete: Athlete }> = ({ athlete }) => {
    const levelInfo = getLevelInfo(athlete.level);
    const statusInfo = getStatusInfo(athlete.status);
    const StatusIcon = statusInfo.icon;

    return (
      <div
        onClick={() => setSelectedAthlete(athlete.id)}
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all ${
          selectedAthlete === athlete.id ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <img
              src={athlete.avatar || `https://ui-avatars.com/api/?name=${athlete.firstName}+${athlete.lastName}&background=3b82f6&color=fff`}
              alt={`${athlete.firstName} ${athlete.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {athlete.firstName} {athlete.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {athlete.sport} {athlete.specialization && `• ${athlete.specialization}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-4 h-4 ${statusInfo.color.includes('green') ? 'text-green-500' : statusInfo.color.includes('red') ? 'text-red-500' : 'text-gray-500'}`} />
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Edad</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {calculateAge(athlete.dateOfBirth)} años
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nivel</p>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${levelInfo.color}`}>
              {levelInfo.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Entrenamientos</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {athlete.stats.completedWorkouts}/{athlete.stats.totalWorkouts}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Horas totales</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {athlete.stats.totalHours}h
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          
          {athlete.lastActivity && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Última actividad: {formatDate(athlete.lastActivity)}
            </p>
          )}
        </div>

        {athlete.nextSession && athlete.status === 'active' && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
            Próxima sesión: {formatDateTime(athlete.nextSession)}
          </div>
        )}
      </div>
    );
  };

  const AthleteListItem: React.FC<{ athlete: Athlete }> = ({ athlete }) => {
    const levelInfo = getLevelInfo(athlete.level);
    const statusInfo = getStatusInfo(athlete.status);
    const StatusIcon = statusInfo.icon;

    return (
      <div
        onClick={() => setSelectedAthlete(athlete.id)}
        className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all ${
          selectedAthlete === athlete.id ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <img
              src={athlete.avatar || `https://ui-avatars.com/api/?name=${athlete.firstName}+${athlete.lastName}&background=3b82f6&color=fff`}
              alt={`${athlete.firstName} ${athlete.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {athlete.firstName} {athlete.lastName}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{athlete.sport}</span>
                  <span>{calculateAge(athlete.dateOfBirth)} años</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelInfo.color}`}>
                    {levelInfo.label}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <span>{athlete.stats.completedWorkouts}/{athlete.stats.totalWorkouts} entrenamientos</span>
                  {athlete.lastActivity && (
                    <span>Última actividad: {formatDate(athlete.lastActivity)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-4 h-4 ${statusInfo.color.includes('green') ? 'text-green-500' : statusInfo.color.includes('red') ? 'text-red-500' : 'text-gray-500'}`} />
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (user?.role !== 'COACH') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Esta página está disponible solo para entrenadores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Atletas - OloTrainer</title>
        <meta name="description" content="Gestiona tus atletas y su progreso" />
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Atletas</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona tus atletas y supervisa su progreso
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Agregar Atleta
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Atletas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{athletes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {athletes.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profesionales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {athletes.filter(a => a.level === 'professional').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(athletes.reduce((acc, a) => acc + a.stats.averageRating, 0) / athletes.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de atletas */}
          <div className="lg:col-span-2">
            {/* Filtros y búsqueda */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Atletas ({filteredAthletes.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {viewMode === 'grid' ? '📋' : '⊞'}
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

              {/* Barra de búsqueda */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar atletas..."
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
                      Deporte
                    </label>
                    <select
                      value={sportFilter}
                      onChange={(e) => setSportFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los deportes</option>
                      {sports.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nivel
                    </label>
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los niveles</option>
                      {levels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
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
                </div>
              )}
            </div>

            {/* Lista de atletas */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredAthletes.length > 0 ? (
                filteredAthletes.map((athlete) => (
                  viewMode === 'grid' ? (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ) : (
                    <AthleteListItem key={athlete.id} athlete={athlete} />
                  )
                ))
              ) : (
                <div className="col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No se encontraron atletas
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No hay atletas que coincidan con los filtros seleccionados.
                  </p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Agregar Primer Atleta
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel de detalles */}
          <div className="lg:col-span-1">
            {selectedAthleteData ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detalles del Atleta
                  </h3>
                  <button
                    onClick={() => setSelectedAthlete(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <img
                      src={selectedAthleteData.avatar || `https://ui-avatars.com/api/?name=${selectedAthleteData.firstName}+${selectedAthleteData.lastName}&background=3b82f6&color=fff`}
                      alt={`${selectedAthleteData.firstName} ${selectedAthleteData.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedAthleteData.firstName} {selectedAthleteData.lastName}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedAthleteData.sport} {selectedAthleteData.specialization && `• ${selectedAthleteData.specialization}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Edad:</span>
                      <p className="text-gray-900 dark:text-white">
                        {calculateAge(selectedAthleteData.dateOfBirth)} años
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nivel:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getLevelInfo(selectedAthleteData.level).color}`}>
                        {getLevelInfo(selectedAthleteData.level).label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contacto:</span>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        {selectedAthleteData.email}
                      </div>
                      {selectedAthleteData.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          {selectedAthleteData.phone}
                        </div>
                      )}
                      {selectedAthleteData.location && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPinIcon className="w-4 h-4 mr-2" />
                          {selectedAthleteData.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estadísticas:</span>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedAthleteData.stats.completedWorkouts}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completados</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedAthleteData.stats.totalHours}h
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total horas</p>
                      </div>
                    </div>
                  </div>

                  {selectedAthleteData.currentProgram && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Programa actual:</span>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {selectedAthleteData.currentProgram}
                      </p>
                    </div>
                  )}

                  {selectedAthleteData.goals.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Objetivos:</span>
                      <ul className="space-y-1">
                        {selectedAthleteData.goals.map((goal, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAthleteData.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Notas:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {selectedAthleteData.notes}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Enviar Mensaje
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Ver Progreso
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Editar Perfil
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecciona un atleta
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Haz clic en un atleta de la lista para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AthletesPage;