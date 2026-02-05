'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Kullanıcı profil bilgileri için type
interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export function useUser() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError(null)

        if (!user) {
          setProfile(null)
          setLoading(false)
          return
        }

        // Profiles tablosundan kullanıcı bilgilerini çek
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          // Profil yoksa hata verme, sadece null bırak
          if (profileError.code === 'PGRST116') {
            setProfile(null)
          } else {
            setError(profileError.message)
          }
        } else {
          setProfile(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadProfile()
    }
  }, [user, authLoading])

  // Profil güncelleme fonksiyonu
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error('Kullanıcı girişi gerekli')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // State'i güncelle
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profil güncellenemedi'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  return {
    user, // Auth user bilgisi
    profile, // Database'deki profil bilgisi
    loading: authLoading || loading,
    error,
    updateProfile,
  }
}
