import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

interface NotificationSettings {
  email: {
    workoutReminders: boolean;
    progressUpdates: boolean;
    messages: boolean;
    achievements: boolean;
    weeklyReports: boolean;
  };
  push: {
    workoutReminders: boolean;
    messages: boolean;
    achievements: boolean;
  };
  sms: {
    workoutReminders: boolean;
    emergencyAlerts: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'coaches_only';
  shareProgress: boolean;
  shareWorkouts: boolean;
  allowMessages: 'everyone' | 'coaches_only' | 'none';
  dataCollection: boolean;
  analytics: boolean;
}

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Estados para el perfil
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    sport: user?.sport || '',
    specialization: user?.specialization || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });

  // Estados para notificaciones
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      workoutReminders: true,
      progressUpdates: true,
      messages: true,
      achievements: true,
      weeklyReports: false
    },
    push: {
      workoutReminders: true,
      messages: true,
      achievements: true
    },
    sms: {
      workoutReminders: false,
      emergencyAlerts: true
    }
  });

  // Estados para privacidad
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'coaches_only',
    shareProgress: true,
    shareWorkouts: false,
    allowMessages: 'coaches_only',
    dataCollection: true,
    analytics: false
  });

  // Estados para preferencias
  const [preferences, setPreferences] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'es',
    timezone: 'Europe/Madrid',
    units: 'metric' as 'metric' | 'imperial',
    weekStart: 'monday' as 'sunday' | 'monday',
    dateFormat: 'dd/mm/yyyy' as 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En producción, aquí se haría la llamada a la API
      // await updateProfile(profileData);
      
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async (category: keyof NotificationSettings, setting: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    
    // Simular guardado automático
    toast.success('Configuración de notificaciones actualizada');
  };

  const handlePrivacyUpdate = async (setting: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [setting]: value
    }));
    
    toast.success('Configuración de privacidad actualizada');
  };

  const handlePreferenceUpdate = async (setting: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
    
    toast.success('Preferencias actualizadas');
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Contraseña cambiada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Cuenta eliminada correctamente');
      // Aquí se redirigiría al login
    } catch (error) {
      toast.error('Error al eliminar la cuenta');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: UserIcon },
    { id: 'notifications', label: 'Notificaciones', icon: BellIcon },
    { id: 'privacy', label: 'Privacidad', icon: ShieldCheckIcon },
    { id: 'security', label: 'Seguridad', icon: KeyIcon },
    { id: 'preferences', label: 'Preferencias', icon: CogIcon }
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' }
  ];

  const timezones = [
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' }
  ];

  return (
    <>
      <Helmet>
        <title>Configuración - OloTrainer</title>
        <meta name="description" content="Configura tus preferencias y ajustes de cuenta" />
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tu cuenta y preferencias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              
              {/* Pestaña de Perfil */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Información del Perfil
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Apellidos
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Deporte Principal
                        </label>
                        <input
                          type="text"
                          value={profileData.sport}
                          onChange={(e) => setProfileData(prev => ({ ...prev, sport: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Especialización
                        </label>
                        <input
                          type="text"
                          value={profileData.specialization}
                          onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Biografía
                      </label>
                      <textarea
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Cuéntanos sobre ti..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Notificaciones */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Configuración de Notificaciones
                  </h2>
                  
                  <div className="space-y-8">
                    {/* Notificaciones por Email */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <EnvelopeIcon className="w-5 h-5 mr-2" />
                        Notificaciones por Email
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(notifications.email).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {key === 'workoutReminders' && 'Recordatorios de entrenamientos'}
                                {key === 'progressUpdates' && 'Actualizaciones de progreso'}
                                {key === 'messages' && 'Nuevos mensajes'}
                                {key === 'achievements' && 'Logros y achievements'}
                                {key === 'weeklyReports' && 'Reportes semanales'}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleNotificationUpdate('email', key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notificaciones Push */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <DevicePhoneMobileIcon className="w-5 h-5 mr-2" />
                        Notificaciones Push
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(notifications.push).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {key === 'workoutReminders' && 'Recordatorios de entrenamientos'}
                                {key === 'messages' && 'Nuevos mensajes'}
                                {key === 'achievements' && 'Logros y achievements'}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleNotificationUpdate('push', key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Privacidad */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Configuración de Privacidad
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Visibilidad del Perfil
                      </label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => handlePrivacyUpdate('profileVisibility', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="public">Público</option>
                        <option value="coaches_only">Solo entrenadores</option>
                        <option value="private">Privado</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Compartir progreso con entrenadores
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Permite que tus entrenadores vean tu progreso y estadísticas
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy.shareProgress}
                            onChange={(e) => handlePrivacyUpdate('shareProgress', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Permitir recopilación de datos para análisis
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ayuda a mejorar la plataforma con datos anónimos
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy.dataCollection}
                            onChange={(e) => handlePrivacyUpdate('dataCollection', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Seguridad */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Configuración de Seguridad
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Cambiar Contraseña
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Actualiza tu contraseña regularmente para mayor seguridad
                          </p>
                        </div>
                        <button
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {showPasswordChange ? 'Cancelar' : 'Cambiar'}
                        </button>
                      </div>

                      {showPasswordChange && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Contraseña Actual
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.current ? (
                                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Nueva Contraseña
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.new ? (
                                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Confirmar Nueva Contraseña
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.confirm ? (
                                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={handlePasswordChange}
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Eliminar cuenta */}
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-red-900 dark:text-red-200">
                            Eliminar Cuenta
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Preferencias */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Preferencias de la Aplicación
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tema
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Claro', icon: SunIcon },
                          { value: 'dark', label: 'Oscuro', icon: MoonIcon },
                          { value: 'system', label: 'Sistema', icon: ComputerDesktopIcon }
                        ].map((theme) => {
                          const Icon = theme.icon;
                          return (
                            <button
                              key={theme.value}
                              onClick={() => handlePreferenceUpdate('theme', theme.value)}
                              className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                                preferences.theme === theme.value
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <Icon className="w-5 h-5 mr-2" />
                              {theme.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Idioma
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => handlePreferenceUpdate('language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Zona Horaria
                        </label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => handlePreferenceUpdate('timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {timezones.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sistema de Unidades
                        </label>
                        <select
                          value={preferences.units}
                          onChange={(e) => handlePreferenceUpdate('units', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="metric">Métrico (kg, km, °C)</option>
                          <option value="imperial">Imperial (lb, mi, °F)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Inicio de Semana
                        </label>
                        <select
                          value={preferences.weekStart}
                          onChange={(e) => handlePreferenceUpdate('weekStart', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="monday">Lunes</option>
                          <option value="sunday">Domingo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de confirmación para eliminar cuenta */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmar Eliminación
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se perderán todos tus datos permanentemente.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Eliminando...' : 'Eliminar Cuenta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsPage;