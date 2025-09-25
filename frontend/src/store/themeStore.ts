import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initializeTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      resolvedTheme: 'light',

      // Actions
      setTheme: (theme: Theme) => {
        const resolvedTheme = resolveTheme(theme)
        
        set({
          theme,
          resolvedTheme,
        })

        // Apply theme to document
        if (resolvedTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
          metaThemeColor.setAttribute(
            'content',
            resolvedTheme === 'dark' ? '#111827' : '#3b82f6'
          )
        }
      },

      toggleTheme: () => {
        const { theme } = get()
        
        if (theme === 'system') {
          const systemTheme = getSystemTheme()
          const newTheme = systemTheme === 'dark' ? 'light' : 'dark'
          get().setTheme(newTheme)
        } else {
          const newTheme = theme === 'dark' ? 'light' : 'dark'
          get().setTheme(newTheme)
        }
      },

      initializeTheme: () => {
        const { theme } = get()
        const resolvedTheme = resolveTheme(theme)
        
        set({ resolvedTheme })

        // Apply theme to document
        if (resolvedTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          
          const handleChange = () => {
            const { theme } = get()
            if (theme === 'system') {
              const newResolvedTheme = getSystemTheme()
              set({ resolvedTheme: newResolvedTheme })
              
              if (newResolvedTheme === 'dark') {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            }
          }

          mediaQuery.addEventListener('change', handleChange)
          
          // Cleanup function (though Zustand doesn't support cleanup directly)
          return () => mediaQuery.removeEventListener('change', handleChange)
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
)

// Selectors
export const useTheme = () => useThemeStore((state) => state.theme)
export const useResolvedTheme = () => useThemeStore((state) => state.resolvedTheme)
export const useThemeActions = () => useThemeStore((state) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  initializeTheme: state.initializeTheme,
}))