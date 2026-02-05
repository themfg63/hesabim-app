'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Hoş geldin, {user.email}</p>
      
      <button onClick={handleSignOut}>
        Çıkış Yap
      </button>
      
      <div>
        <h2>Buraya içerik ekleyebilirsin</h2>
      </div>
    </div>
  )
}
