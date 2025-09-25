import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { authApi } from '@/services/api/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true)
      await authApi.forgotPassword(data)
      setEmailSent(true)
      toast.success('Email de recuperación enviado')
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const email = getValues('email')
    if (!email) {
      toast.error('Por favor ingresa tu email primero')
      return
    }

    try {
      setIsLoading(true)
      await authApi.forgotPassword({ email })
      toast.success('Email reenviado')
    } catch (error: any) {
      toast.error(error.message || 'Error al reenviar el email')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-success-100 dark:bg-success-900/20">
              <EnvelopeIcon className="h-8 w-8 text-success-600 dark:text-success-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Email Enviado
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Hemos enviado las instrucciones de recuperación a tu email
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Si no recibes el email en unos minutos, revisa tu carpeta de spam.
              </p>
              
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="btn-secondary w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Reenviando...
                    </>
                  ) : (
                    'Reenviar Email'
                  )}
                </button>
                
                <Link
                  to="/login"
                  className="btn-ghost w-full inline-flex items-center justify-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Volver al Login
                </Link>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Necesitas ayuda?{' '}
              <a
                href="mailto:support@olotrainer.com"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Contacta soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    )
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
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu email para recibir instrucciones de recuperación
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="mt-1 relative">
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={cn(
                  'input pl-10',
                  errors.email && 'input-error'
                )}
                placeholder="tu@email.com"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                {errors.email.message}
              </p>
            )}
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
                  Enviando...
                </>
              ) : (
                'Enviar Instrucciones'
              )}
            </button>
          </div>

          {/* Back to login */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Volver al Login
            </Link>
          </div>
        </form>

        {/* Additional help */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                ¿No recuerdas tu email?
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Si no recuerdas el email asociado a tu cuenta, contacta a nuestro equipo de soporte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}