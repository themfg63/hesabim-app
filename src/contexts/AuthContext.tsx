'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '@/lib/auth-api'
import { useRouter } from 'next/navigation'

// Auth Context için type tanımlamaları
interface User {
  id: string
  name: string
  surname: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (name: string, surname: string, email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => void
}

// Context oluşturma
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan user bilgisini kontrol et
    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const savedUser = localStorage.getItem('user')
        
        if (accessToken && savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Kayıt olma fonksiyonu
  const signUp = async (name: string, surname: string, email: string, password: string) => {
    try {
      const token = await authApi.register({ name, surname, email, password })
      
      // Kayıt başarılı - otomatik giriş yap
      const loginResult = await signIn(email, password)
      return loginResult
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Kayıt sırasında bir hata oluştu'
      return { error: errorMessage }
    }
  }

  // Giriş yapma fonksiyonu
  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      
      // Token'ları localStorage'a kaydet
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      // JWT'den user bilgisini çıkar
      const userData = authApi.parseJWT(response.accessToken)
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      }
      
      return { error: null }
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Giriş sırasında bir hata oluştu'
      return { error: errorMessage }
    }
  }

  // Çıkış yapma fonksiyonu
  const signOut = () => {
    authApi.logout()
    setUser(null)
    router.push('/login')
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook - Context'i kullanmak için
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth hook\'u AuthProvider içinde kullanılmalı')
  }
  
  return context
}
