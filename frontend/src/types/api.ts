export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  startDate?: string
  endDate?: string
  status?: string
  category?: string
  type?: string
}

export interface QueryParams extends PaginationParams, FilterParams {
  [key: string]: any
}

// Common response types
export interface MessageResponse {
  message: string
}

export interface CountResponse {
  count: number
}

export interface StatsResponse {
  [key: string]: number | string | object
}

// File upload types
export interface FileUploadResponse {
  url: string
  filename: string
  originalName: string
  size: number
  mimeType: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// WebSocket types
export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
  userId?: string
}

export interface NotificationData {
  id: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, any>
}

// Error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: ValidationError[]
  statusCode: number
  timestamp: string
  path: string
}