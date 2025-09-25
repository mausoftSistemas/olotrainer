import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils/cn'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Abrir menú</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Buscar
          </label>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 sm:text-sm"
            placeholder="Buscar..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Theme toggle */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={toggleTheme}
          >
            <span className="sr-only">Cambiar tema</span>
            {theme === 'dark' ? (
              <SunIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Abrir menú de usuario</span>
              {user?.avatar ? (
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white" aria-hidden="true">
                  {user?.firstName} {user?.lastName}
                </span>
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={cn(
                        active ? 'bg-gray-50 dark:bg-gray-700' : '',
                        'flex items-center px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white'
                      )}
                    >
                      <UserCircleIcon className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={cn(
                        active ? 'bg-gray-50 dark:bg-gray-700' : '',
                        'flex items-center px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white'
                      )}
                    >
                      <Cog6ToothIcon className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={cn(
                        active ? 'bg-gray-50 dark:bg-gray-700' : '',
                        'flex w-full items-center px-3 py-1 text-left text-sm leading-6 text-gray-900 dark:text-white'
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  )
}