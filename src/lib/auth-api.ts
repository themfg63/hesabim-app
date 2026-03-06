import apiClient from './api-client'

export interface RegisterData {
  name: string
  surname: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  name: string
  surname: string
  email: string
}

// Kayıt olma
export const register = async (data: RegisterData): Promise<string> => {
  const response = await apiClient.post<string>('/api/register', data)
  return response.data
}

// Giriş yapma
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/login', data)
  return response.data
}

// Token yenileme
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/refresh', {
    refreshToken,
  })
  return response.data
}

// Kullanıcı bilgilerini JWT'den çıkar (basit parsing)
export const parseJWT = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT parsing error:', error)
    return null
  }
}

// Çıkış yapma (local storage'ı temizle)
export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}
