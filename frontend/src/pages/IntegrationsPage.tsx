import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'health' | 'social' | 'analytics' | 'other';
  icon: string;
  isConnected: boolean;
  isEnabled: boolean;
  connectedAt?: Date;
  lastSync?: Date;
  syncStatus: 'success' | 'error' | 'pending' | 'never';
  features: string[];
  website: string;
  requiresAuth: boolean;
  isPremium: boolean;
  config?: Record<string, any>;
}

const IntegrationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  // Mock data - En producción esto vendría de la API
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Strava',
      description: 'Sincroniza automáticamente tus actividades de running y ciclismo desde Strava',
      category: 'fitness',
      icon: '🏃‍♂️',
      isConnected: true,
      isEnabled: true,
      connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      lastSync: new Date(Date.now() - 1000 * 60 * 30),
      syncStatus: 'success',
      features: ['Actividades automáticas', 'Métricas de rendimiento', 'Rutas GPS', 'Segmentos'],
      website: 'https://strava.com',
      requiresAuth: true,
      isPremium: false
    },
    {
      id: '2',
      name: 'MyFitnessPal',
      description: 'Importa datos nutricionales y de calorías para un seguimiento completo',
      category: 'nutrition',
      icon: '🍎',
      isConnected: false,
      isEnabled: false,
      syncStatus: 'never',
      features: ['Registro de comidas', 'Conteo de calorías', 'Macronutrientes', 'Base de datos de alimentos'],
      website: 'https://myfitnesspal.com',
      requiresAuth: true,
      isPremium: false
    },
    {
      id: '3',
      name: 'Fitbit',
      description: 'Conecta tu dispositivo Fitbit para sincronizar pasos, sueño y frecuencia cardíaca',
      category: 'health',
      icon: '⌚',
      isConnected: true,
      isEnabled: false,
      connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2),
      syncStatus: 'error',
      features: ['Pasos diarios', 'Monitoreo del sueño', 'Frecuencia cardíaca', 'Calorías quemadas'],
      website: 'https://fitbit.com',
      requiresAuth: true,
      isPremium: false
    },
    {
      id: '4',
      name: 'Google Fit',
      description: 'Sincroniza datos de salud y fitness desde Google Fit',
      category: 'health',
      icon: '📱',
      isConnected: false,
      isEnabled: false,
      syncStatus: 'never',
      features: ['Actividad física', 'Peso corporal', 'Presión arterial', 'Glucosa'],
      website: 'https://fit.google.com',
      requiresAuth: true,
      isPremium: false
    },
    {
      id: '5',
      name: 'Garmin Connect',
      description: 'Importa entrenamientos y métricas avanzadas desde dispositivos Garmin',
      category: 'fitness',
      icon: '⌚',
      isConnected: false,
      isEnabled: false,
      syncStatus: 'never',
      features: ['Entrenamientos avanzados', 'VO2 Max', 'Tiempo de recuperación', 'Métricas de carrera'],
      website: 'https://connect.garmin.com',
      requiresAuth: true,
      isPremium: true
    },
    {
      id: '6',
      name: 'Polar Flow',
      description: 'Conecta con Polar Flow para datos de entrenamiento y recuperación',
      category: 'fitness',
      icon: '❄️',
      isConnected: false,
      isEnabled: false,
      syncStatus: 'never',
      features: ['Análisis de entrenamiento', 'Carga de entrenamiento', 'Recuperación', 'Zonas de FC'],
      website: 'https://flow.polar.com',
      requiresAuth: true,
      isPremium: true
    },
    {
      id: '7',
      name: 'Cronometer',
      description: 'Seguimiento detallado de nutrición y micronutrientes',
      category: 'nutrition',
      icon: '📊',
      isConnected: false,
      isEnabled: false,
      syncStatus: 'never',
      features: ['Micronutrientes', 'Análisis nutricional', 'Recetas', 'Objetivos personalizados'],
      website: 'https://cronometer.com',
      requiresAuth: true,
      isPremium: true
    },
    {
      id: '8',
      name: 'Whoop',
      description: 'Datos de recuperación, sueño y strain desde Whoop',
      category: 'health',
      icon: '🔴',
      isConnected: false,
      isEnabled: false,
      syncStatus: 'never',
      features: ['Strain Score', 'Recuperación', 'Calidad del sueño', 'VFC'],
      website: 'https://whoop.com',
      requiresAuth: true,
      isPremium: true
    }
  ]);

  const categories = [
    { value: 'all', label: 'Todas', icon: '🔗', count: integrations.length },
    { value: 'fitness', label: 'Fitness', icon: '💪', count: integrations.filter(i => i.category === 'fitness').length },
    { value: 'nutrition', label: 'Nutrición', icon: '🥗', count: integrations.filter(i => i.category === 'nutrition').length },
    { value: 'health', label: 'Salud', icon: '❤️', count: integrations.filter(i => i.category === 'health').length },
    { value: 'social', label: 'Social', icon: '👥', count: integrations.filter(i => i.category === 'social').length },
    { value: 'analytics', label: 'Analytics', icon: '📈', count: integrations.filter(i => i.category === 'analytics').length }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedIntegrations = integrations.filter(i => i.isConnected);
  const enabledIntegrations = integrations.filter(i => i.isEnabled);

  const handleConnect = async (integrationId: string) => {
    setIsLoading(true);
    // Simular conexión
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              isConnected: true, 
              connectedAt: new Date(),
              lastSync: new Date(),
              syncStatus: 'success' as const
            }
          : integration
      ));
      setIsLoading(false);
    }, 2000);
  };

  const handleDisconnect = async (integrationId: string) => {
    setIsLoading(true);
    // Simular desconexión
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              isConnected: false, 
              isEnabled: false,
              connectedAt: undefined,
              lastSync: undefined,
              syncStatus: 'never' as const
            }
          : integration
      ));
      setIsLoading(false);
    }, 1000);
  };

  const handleToggleEnabled = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ));
  };

  const handleSync = async (integrationId: string) => {
    setIsLoading(true);
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, syncStatus: 'pending' as const }
        : integration
    ));

    // Simular sincronización
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              lastSync: new Date(),
              syncStatus: Math.random() > 0.2 ? 'success' as const : 'error' as const
            }
          : integration
      ));
      setIsLoading(false);
    }, 3000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSyncStatusInfo = (status: string) => {
    switch (status) {
      case 'success':
        return { icon: CheckCircleIcon, color: 'text-green-500', label: 'Sincronizado' };
      case 'error':
        return { icon: ExclamationTriangleIcon, color: 'text-red-500', label: 'Error' };
      case 'pending':
        return { icon: ClockIcon, color: 'text-yellow-500', label: 'Sincronizando...' };
      default:
        return { icon: ClockIcon, color: 'text-gray-400', label: 'Nunca' };
    }
  };

  const IntegrationCard: React.FC<{ integration: Integration }> = ({ integration }) => {
    const syncInfo = getSyncStatusInfo(integration.syncStatus);
    const SyncIcon = syncInfo.icon;

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">{integration.icon}</div>
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {integration.name}
                </h3>
                {integration.isPremium && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {integration.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {integration.isConnected && (
              <div className="flex items-center">
                <SyncIcon className={`w-4 h-4 ${syncInfo.color} mr-1`} />
                <span className={`text-xs ${syncInfo.color}`}>
                  {syncInfo.label}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Características:
          </h4>
          <div className="flex flex-wrap gap-1">
            {integration.features.map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {integration.isConnected && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 dark:text-green-300">
                Conectado {integration.connectedAt && formatDate(integration.connectedAt)}
              </span>
              {integration.lastSync && (
                <span className="text-green-600 dark:text-green-400">
                  Última sync: {formatDate(integration.lastSync)}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={integration.isEnabled}
                  onChange={() => handleToggleEnabled(integration.id)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-green-700 dark:text-green-300">
                  Sincronización automática
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <a
              href={integration.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Sitio web
              <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
            </a>
          </div>
          
          <div className="flex items-center space-x-2">
            {integration.isConnected ? (
              <>
                <button
                  onClick={() => handleSync(integration.id)}
                  disabled={isLoading || integration.syncStatus === 'pending'}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {integration.syncStatus === 'pending' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Sincronizar'
                  )}
                </button>
                <button
                  onClick={() => setSelectedIntegration(integration.id)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect(integration.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Conectar'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Integraciones - OloTrainer</title>
        <meta name="description" content="Conecta OloTrainer con tus aplicaciones y dispositivos favoritos" />
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Integraciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Conecta OloTrainer con tus aplicaciones y dispositivos favoritos para una experiencia completa
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{integrations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conectadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{connectedIntegrations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <BoltIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{enabledIntegrations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {integrations.filter(i => i.isPremium).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Categorías */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                  <span className="ml-2 px-2 py-0.5 text-xs bg-white dark:bg-gray-800 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar integraciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-64 pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de integraciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIntegrations.length > 0 ? (
            filteredIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))
          ) : (
            <div className="col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron integraciones
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No hay integraciones que coincidan con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                Seguridad y Privacidad
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Todas las integraciones utilizan OAuth 2.0 y conexiones seguras. Tus datos están protegidos 
                y puedes revocar el acceso en cualquier momento. Solo sincronizamos los datos que necesitas 
                para mejorar tu experiencia de entrenamiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntegrationsPage;