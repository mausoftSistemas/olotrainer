import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { authApi } from '@/services/api/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
      return
    }

    // Validate token on component mount
    const validateToken = async () => {
      try {
        // You might want to add a token validation endpoint
        setIsValidToken(true)
      } catch (error) {
        setIsValidToken(false)
        toast.error('Token inválido o expirado')
      }
    }

    validateToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token no válido')
      return
    }

    try {
      setIsLoading(true)
      await authApi.resetPassword({
        token,
        password: data.password,
      })
      setIsSuccess(true)
      toast.success('Contraseña restablecida exitosamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al restablecer la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  // Loading state while validating token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Validando token...
          </p>
        </div>
      </div>
    )
  }

  // Invalid token
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-error-100 dark:bg-error-900/20">
              <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Token Inválido
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              El enlace de recuperación es inválido o ha expirado
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                El enlace que has usado no es válido o ha expirado. Por favor, solicita un nuevo enlace de recuperación.
              </p>
              
              <div className="pt-4 space-y-3">
                <Link
                  to="/forgot-password"
                  className="btn-primary w-full"
                >
                  Solicitar Nuevo Enlace
                </Link>
                
                <Link
                  to="/login"
                  className="btn-ghost w-full"
                >
                  Volver al Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-success-100 dark:bg-success-900/20">
              <CheckCircleIcon className="h-8 w-8 text-success-600 dark:text-success-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              ¡Contraseña Restablecida!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Tu contraseña ha sido actualizada exitosamente
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              
              <button
                onClick={handleGoToLogin}
                className="btn-primary w-full"
              >
                Ir al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-primary-600">
            <span className="text-xl font-bold text-white">OT</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nueva Contraseña
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar Nueva Contraseña
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
          </div>

          {/* Password requirements */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Requisitos de la contraseña:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Mínimo 8 caracteres</li>
              <li>• Al menos una letra mayúscula</li>
              <li>• Al menos una letra minúscula</li>
              <li>• Al menos un número</li>
            </ul>
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
                  Restableciendo...
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </div>

          {/* Back to login */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Volver al Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}