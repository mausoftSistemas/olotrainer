import { api } from './client'
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  EmailVerificationData,
  ResendVerificationData,
} from '@/types/auth'
import type { ApiResponse, MessageResponse } from '@/types/api'

export const authApi = {
  // Authentication
  async login(credentials: LoginCredentials) {
    return api.post<AuthResponse>('/auth/login', credentials)
  },

  async register(data: RegisterData) {
    return api.post<AuthResponse>('/auth/register', data)
  },

  async logout() {
    return api.post<MessageResponse>('/auth/logout')
  },

  async refreshToken() {
    return api.post<AuthResponse>('/auth/refresh')
  },

  // User profile
  async me() {
    return api.get<User>('/auth/me')
  },

  async updateProfile(data: UpdateProfileData) {
    return api.put<User>('/auth/profile', data)
  },

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.upload<{ url: string }>('/auth/avatar', formData)
  },

  async deleteAvatar() {
    return api.delete<MessageResponse>('/auth/avatar')
  },

  // Password management
  async changePassword(data: ChangePasswordData) {
    return api.put<MessageResponse>('/auth/password', data)
  },

  async forgotPassword(data: ForgotPasswordData) {
    return api.post<MessageResponse>('/auth/forgot-password', data)
  },

  async resetPassword(data: ResetPasswordData) {
    return api.post<MessageResponse>('/auth/reset-password', data)
  },

  // Email verification
  async verifyEmail(data: EmailVerificationData) {
    return api.post<MessageResponse>('/auth/verify-email', data)
  },

  async resendVerification(data: ResendVerificationData) {
    return api.post<MessageResponse>('/auth/resend-verification', data)
  },

  // Account management
  async deactivateAccount() {
    return api.put<MessageResponse>('/auth/deactivate')
  },

  async deleteAccount() {
    return api.delete<MessageResponse>('/auth/account')
  },

  // Two-factor authentication
  async enableTwoFactor() {
    return api.post<{ qrCode: string; secret: string }>('/auth/2fa/enable')
  },

  async confirmTwoFactor(data: { token: string; secret: string }) {
    return api.post<{ backupCodes: string[] }>('/auth/2fa/confirm', data)
  },

  async disableTwoFactor(data: { token: string }) {
    return api.post<MessageResponse>('/auth/2fa/disable', data)
  },

  async verifyTwoFactor(data: { token: string }) {
    return api.post<AuthResponse>('/auth/2fa/verify', data)
  },

  // Sessions management
  async getSessions() {
    return api.get<Array<{
      id: string
      device: string
      browser: string
      location: string
      current: boolean
      lastActive: string
    }>>('/auth/sessions')
  },

  async revokeSession(sessionId: string) {
    return api.delete<MessageResponse>(`/auth/sessions/${sessionId}`)
  },

  async revokeAllSessions() {
    return api.delete<MessageResponse>('/auth/sessions')
  },
}