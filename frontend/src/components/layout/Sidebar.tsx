import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  PuzzlePieceIcon,
  CogIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['COACH', 'ATHLETE'] },
  { name: 'Actividades', href: '/activities', icon: ClipboardDocumentListIcon, roles: ['COACH', 'ATHLETE'] },
  { name: 'Entrenamientos', href: '/workouts', icon: ChartBarIcon, roles: ['COACH', 'ATHLETE'] },
  { name: 'Mensajes', href: '/messages', icon: ChatBubbleLeftRightIcon, roles: ['COACH', 'ATHLETE'] },
  { name: 'Feedback', href: '/feedback', icon: StarIcon, roles: ['COACH', 'ATHLETE'] },
  { name: 'Progreso', href: '/progress', icon: ChartBarIcon, roles: ['COACH', 'ATHLETE'] },
  { name: 'Integraciones', href: '/integrations', icon: PuzzlePieceIcon, roles: ['COACH', 'ATHLETE'] },
  { name: 'Atletas', href: '/athletes', icon: UserGroupIcon, roles: ['COACH'] },
]

const secondaryNavigation = [
  { name: 'Configuración', href: '/settings', icon: CogIcon },
]

export default function Sidebar() {
  const { user } = useAuthStore()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'ATHLETE')
  )

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 dark:bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-sm font-bold text-white">OT</span>
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
            OloTrainer
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200'
                      )
                    }
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>

          {/* Secondary navigation */}
          <li className="mt-auto">
            <ul role="list" className="-mx-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200'
                      )
                    }
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>

      {/* User info */}
      {user && (
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center">
            {user.avatar ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.role === 'COACH' ? 'Entrenador' : 'Atleta'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}