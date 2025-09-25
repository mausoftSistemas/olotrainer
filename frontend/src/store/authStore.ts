import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/api/auth'
import type { User, LoginCredentials, RegisterData } from '@/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  clearAuth: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true })
          
          const response = await authApi.login(credentials)
          const { user, token } = response.data
          
          // Store token in localStorage for API requests
          localStorage.setItem('auth_token', token)
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })
          
          const response = await authApi.register(data)
          const { user, token } = response.data
          
          // Store token in localStorage for API requests
          localStorage.setItem('auth_token', token)
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem('auth_token')
        
        // Clear auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
        
        // Call logout API to invalidate token on server
        authApi.logout().catch(console.error)
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('auth_token')
          
          if (!token) {
            set({ isLoading: false })
            return
          }
          
          set({ isLoading: true })
          
          const response = await authApi.me()
          const user = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          // Token is invalid, clear auth
          localStorage.removeItem('auth_token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },

      clearAuth: () => {
        localStorage.removeItem('auth_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  checkAuth: state.checkAuth,
  updateUser: state.updateUser,
  clearAuth: state.clearAuth,
}))