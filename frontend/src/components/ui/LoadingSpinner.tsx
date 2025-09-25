import React from 'react'
import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'current'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const colorClasses = {
  primary: 'border-primary-600 border-t-transparent',
  secondary: 'border-gray-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  current: 'border-current border-t-transparent',
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Cargando..."
    >
      <span className="sr-only">Cargando...</span>
    </div>
  )
}

// Named export for compatibility
export { LoadingSpinner }