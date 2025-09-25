import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
  role: z.enum(['COACH', 'ATHLETE'], {
    required_error: 'Selecciona tu rol',
  }),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  sport: z.string().optional(),
  specialization: z.string().optional(),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ATHLETE',
      acceptTerms: false,
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      await registerUser(data)
      toast.success('¡Cuenta creada exitosamente!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-primary-600">
            <span className="text-xl font-bold text-white">OT</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Únete a la comunidad de OloTrainer
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ¿Eres entrenador o atleta?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    {...register('role')}
                    type="radio"
                    value="COACH"
                    className="sr-only peer"
                  />
                  <div className="p-3 border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:border-gray-600 dark:peer-checked:border-primary-400 dark:peer-checked:bg-primary-900/20 transition-colors">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Entrenador
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Gestiona atletas
                      </div>
                    </div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    {...register('role')}
                    type="radio"
                    value="ATHLETE"
                    className="sr-only peer"
                  />
                  <div className="p-3 border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:border-gray-600 dark:peer-checked:border-primary-400 dark:peer-checked:bg-primary-900/20 transition-colors">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Atleta
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Entrena y mejora
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  autoComplete="given-name"
                  className={cn(
                    'input mt-1',
                    errors.firstName && 'input-error'
                  )}
                  placeholder="Juan"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Apellido
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  autoComplete="family-name"
                  className={cn(
                    'input mt-1',
                    errors.lastName && 'input-error'
                  )}
                  placeholder="Pérez"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={cn(
                  'input mt-1',
                  errors.email && 'input-error'
                )}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn(
                    'input pr-10',
                    errors.password && 'input-error'
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn(
                    'input pr-10',
                    errors.confirmPassword && 'input-error'
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role-specific fields */}
            {selectedRole === 'ATHLETE' && (
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deporte (opcional)
                </label>
                <input
                  {...register('sport')}
                  type="text"
                  className="input mt-1"
                  placeholder="Ej: Ciclismo, Running, Natación"
                />
              </div>
            )}

            {selectedRole === 'COACH' && (
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Especialización (opcional)
                </label>
                <input
                  {...register('specialization')}
                  type="text"
                  className="input mt-1"
                  placeholder="Ej: Entrenamiento de resistencia"
                />
              </div>
            )}

            {/* Terms and conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-gray-700 dark:text-gray-300">
                  Acepto los{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                    política de privacidad
                  </Link>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center py-3"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}