export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'COACH' | 'ATHLETE'
  avatar?: string
  bio?: string
  dateOfBirth?: string
  phone?: string
  location?: string
  timezone?: string
  language?: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
  
  // Coach-specific fields
  specialization?: string
  experience?: number
  certifications?: string[]
  
  // Athlete-specific fields
  sport?: string
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL'
  goals?: string[]
  coachId?: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: 'COACH' | 'ATHLETE'
  acceptTerms: boolean
  
  // Optional fields
  phone?: string
  dateOfBirth?: string
  sport?: string
  specialization?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  bio?: string
  phone?: string
  location?: string
  timezone?: string
  language?: string
  
  // Coach-specific
  specialization?: string
  experience?: number
  certifications?: string[]
  
  // Athlete-specific
  sport?: string
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL'
  goals?: string[]
}

export interface EmailVerificationData {
  token: string
}

export interface ResendVerificationData {
  email: string
}