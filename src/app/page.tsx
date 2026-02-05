'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { PlusCircle, TrendingUp, TrendingDown, Trash2, Calendar, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type Transaction = {
  id: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  description: string
  date: string
  category?: {
    name: string
    icon: string
    color: string
  }
}

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  
  // Form state
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Auth kontrolü
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Verileri yükle
  useEffect(() => {
    if (user) {
      fetchCategories()
      fetchTransactions()
    }
  }, [user])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Kategori yükleme hatası:', error)
    } else {
      setCategories(data || [])
    }
  }

  const fetchTransactions = async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('İşlem yükleme hatası:', error)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }

  const addTransaction = async () => {
    if (!amount || !selectedCategory || !user) {
      alert('Lütfen tüm alanları doldurun')
      return
    }

    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: user.id,
          amount: parseFloat(amount),
          type: transactionType,
          category_id: selectedCategory,
          description,
          date
        }
      ])

    if (error) {
      console.error('İşlem ekleme hatası:', error)
      alert('İşlem eklenirken hata oluştu')
    } else {
      // Formu sıfırla
      setAmount('')
      setDescription('')
      setSelectedCategory('')
      setDate(new Date().toISOString().split('T')[0])
      setShowAddModal(false)
      
      // Listeyi yenile
      fetchTransactions()
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Silme hatası:', error)
    } else {
      fetchTransactions()
    }
  }

  // Özet hesaplama
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

  const balance = totalIncome - totalExpense

  const filteredCategories = categories.filter(c => c.type === transactionType)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">💰 Hesabım</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Toplam Bakiye */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Bakiye</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={balance >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
              </div>
            </div>
          </div>

          {/* Toplam Gelir */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Gelir</p>
                <p className="text-2xl font-bold text-green-600">
                  ₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Toplam Gider */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Gider</p>
                <p className="text-2xl font-bold text-red-600">
                  ₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Ekle Butonları */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setTransactionType('income')
              setShowAddModal(true)
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} />
            Gelir Ekle
          </button>
          <button
            onClick={() => {
              setTransactionType('expense')
              setShowAddModal(true)
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} />
            Gider Ekle
          </button>
        </div>

        {/* İşlemler Listesi */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Son İşlemler</h2>
          
          {loading ? (
            <p className="text-center text-gray-500 py-8">Yükleniyor...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Henüz işlem yok. Hemen ekleyin!</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: transaction.category?.color + '20' }}
                    >
                      {transaction.category?.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.category?.name}</p>
                      <p className="text-sm text-gray-500">{transaction.description}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {format(new Date(transaction.date), 'dd MMMM yyyy', { locale: tr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₺
                      {parseFloat(transaction.amount.toString()).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {transactionType === 'income' ? '💰 Gelir Ekle' : '💸 Gider Ekle'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tutar (₺)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Kategori seçin</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama (Opsiyonel)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Açıklama girin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={addTransaction}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition ${
                  transactionType === 'income'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}