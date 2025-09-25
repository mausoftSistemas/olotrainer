import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import type { ApiResponse, ApiError } from '@/types/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  (error) => {
    const { response, request, message } = error

    // Network error
    if (!response) {
      if (request) {
        toast.error('Error de conexión. Verifica tu conexión a internet.')
      } else {
        toast.error('Error de configuración de la solicitud.')
      }
      return Promise.reject({
        success: false,
        message: 'Error de conexión',
        statusCode: 0,
      } as ApiError)
    }

    // HTTP error responses
    const { status, data } = response
    const apiError: ApiError = {
      success: false,
      message: data?.message || 'Error desconocido',
      errors: data?.errors,
      statusCode: status,
    }

    // Handle specific status codes
    switch (status) {
      case 400:
        // Bad request - validation errors
        if (data?.errors) {
          // Show validation errors
          Object.entries(data.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => toast.error(`${field}: ${msg}`))
            }
          })
        } else {
          toast.error(data?.message || 'Solicitud inválida')
        }
        break

      case 401:
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('auth_token')
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        
        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login'
        }
        break

      case 403:
        // Forbidden
        toast.error('No tienes permisos para realizar esta acción')
        break

      case 404:
        // Not found
        toast.error('Recurso no encontrado')
        break

      case 409:
        // Conflict
        toast.error(data?.message || 'Conflicto en la solicitud')
        break

      case 422:
        // Unprocessable entity - validation errors
        toast.error(data?.message || 'Datos de entrada inválidos')
        break

      case 429:
        // Too many requests
        toast.error('Demasiadas solicitudes. Intenta nuevamente más tarde.')
        break

      case 500:
        // Internal server error
        toast.error('Error interno del servidor. Intenta nuevamente más tarde.')
        break

      case 502:
      case 503:
      case 504:
        // Server errors
        toast.error('Servicio no disponible. Intenta nuevamente más tarde.')
        break

      default:
        toast.error(data?.message || 'Error desconocido')
        break
    }

    return Promise.reject(apiError)
  }
)

// API client wrapper with typed methods
export class ApiClient {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, config)
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data, config)
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data, config)
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data, config)
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url, config)
  }

  // Upload file with progress
  async upload<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
  }

  // Download file
  async download(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
    })

    // Create download link
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// Export the configured client
export const api = new ApiClient(apiClient)
export default apiClient