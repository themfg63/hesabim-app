# Hesabım App - Yol Haritası

## 📋 Proje Genel Bakış
Supabase veritabanı ile direkt bağlantılı, kullanıcı kimlik doğrulama sistemi ve kişisel veri yönetimi uygulaması.

---

## 🎯 Aşama 1: Supabase Kurulumu ve Yapılandırma

### 1.1 Supabase Projesini Hazırlama
- [ ] Supabase Dashboard'da Authentication'ı etkinleştir
- [ ] Email/Password provider'ını aktif et
- [ ] Email confirmation ayarlarını yapılandır (isteğe bağlı)
- [ ] Row Level Security (RLS) politikalarını planla

### 1.2 Environment Variables
- [ ] `.env.local` dosyası oluştur
- [ ] Supabase URL'i ekle: `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Supabase Anon Key ekle: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local` dosyasını `.gitignore`'a ekle

### 1.3 Supabase Client Güncellemesi
- [ ] `src/lib/supabase.ts` dosyasını gözden geçir
- [ ] Auth için gerekli method'ları ekle

---

## 🎯 Aşama 2: Kimlik Doğrulama Altyapısı

### 2.1 Auth Context Oluşturma
- [ ] `src/contexts/AuthContext.tsx` dosyası oluştur
- [ ] User state yönetimi
- [ ] Login, Logout, Signup fonksiyonları
- [ ] Session yönetimi
- [ ] Loading state kontrolü

### 2.2 Auth Hook'ları
- [ ] `src/hooks/useAuth.ts` - Auth context'i kullanmak için
- [ ] `src/hooks/useUser.ts` - Kullanıcı bilgilerine erişim

### 2.3 Middleware/Route Protection
- [ ] `src/middleware.ts` dosyası oluştur
- [ ] Protected route'ları kontrol et
- [ ] Giriş yapmamış kullanıcıları yönlendir

---

## 🎯 Aşama 3: Kimlik Doğrulama Sayfaları

### 3.1 Login Sayfası (`/login`)
- [ ] `src/app/login/page.tsx` oluştur
- [ ] Email input
- [ ] Password input
- [ ] "Giriş Yap" butonu
- [ ] "Kayıt Ol" sayfasına link
- [ ] "Şifremi Unuttum" linki (opsiyonel)
- [ ] Error handling ve mesajlar
- [ ] Form validasyonu

### 3.2 Kayıt Sayfası (`/register`)
- [ ] `src/app/register/page.tsx` oluştur
- [ ] Email input
- [ ] Password input
- [ ] Password confirmation input
- [ ] "Kayıt Ol" butonu
- [ ] "Giriş Yap" sayfasına link
- [ ] Error handling ve mesajlar
- [ ] Form validasyonu
- [ ] Email formatı kontrolü
- [ ] Şifre gücü kontrolü

### 3.3 Şifre Sıfırlama (Opsiyonel)
- [ ] `src/app/reset-password/page.tsx`
- [ ] Email gönderme formu
- [ ] Yeni şifre belirleme sayfası

---

## 🎯 Aşama 4: Database Schema ve RLS

### 4.1 Kullanıcı Profil Tablosu
```sql
-- profiles tablosu
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Row Level Security (RLS) Politikaları
```sql
-- Kullanıcılar sadece kendi verilerini görebilir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);
```

### 4.3 Triggers (Otomatik Profil Oluşturma)
```sql
-- Yeni kullanıcı kaydında otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎯 Aşama 5: Korumalı Sayfalar

### 5.1 Dashboard/Ana Sayfa
- [ ] `src/app/dashboard/page.tsx` oluştur
- [ ] Kullanıcı bilgilerini göster
- [ ] Kullanıcıya özel verileri listele
- [ ] Logout butonu

### 5.2 Layout Güncellemesi
- [ ] `src/app/layout.tsx`'i güncelle
- [ ] AuthProvider ile sarmalama
- [ ] Global navigation (giriş yapan kullanıcılar için)

### 5.3 Protected Layout
- [ ] `src/app/(protected)/layout.tsx` oluştur
- [ ] Auth kontrolü yap
- [ ] Sidebar/Navigation ekle

---

## 🎯 Aşama 6: Kullanıcı Verilerini Yönetme

### 6.1 Veri Tabloları Oluşturma
Örnek: Hesap/Harcama sistemi için
```sql
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Politikaları
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
ON transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE
USING (auth.uid() = user_id);
```

### 6.2 API/Server Actions
- [ ] `src/app/actions/transactions.ts` oluştur
- [ ] Server-side veri alma fonksiyonları
- [ ] CRUD operasyonları
- [ ] Type-safe işlemler

### 6.3 Veri Gösterimi Sayfaları
- [ ] Liste sayfası (transactions listesi)
- [ ] Detay sayfası
- [ ] Ekleme/Düzenleme formları

---

## 🎯 Aşama 7: UI/UX İyileştirmeleri

### 7.1 Component Library
- [ ] Loading spinners
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Modal components
- [ ] Form components

### 7.2 Responsive Design
- [ ] Mobile uyumlu layout
- [ ] Tablet görünümü
- [ ] Desktop optimizasyonu

### 7.3 Dark/Light Mode (Opsiyonel)
- [ ] Theme provider
- [ ] Theme toggle butonu

---

## 🎯 Aşama 8: Güvenlik ve Optimizasyon

### 8.1 Güvenlik
- [ ] CSRF koruması
- [ ] XSS koruması
- [ ] Rate limiting (Supabase tarafında)
- [ ] Input sanitization
- [ ] SQL Injection koruması (RLS ile)

### 8.2 Performance
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Caching stratejileri

### 8.3 Error Handling
- [ ] Global error handler
- [ ] User-friendly error messages
- [ ] Error logging

---

## 🎯 Aşama 9: Test ve Deploy

### 9.1 Testing
- [ ] Auth flow testleri
- [ ] Form validasyon testleri
- [ ] RLS politika testleri

### 9.2 Deployment
- [ ] Vercel'e deploy
- [ ] Environment variables ayarla
- [ ] Domain bağla (opsiyonel)

---

## 📁 Önerilen Klasör Yapısı

```
src/
├── app/
│   ├── (auth)/                 # Auth sayfaları grubu
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (protected)/            # Korumalı sayfalar grubu
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Sidebar.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useUser.ts
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── types/
│   ├── database.types.ts       # Supabase'den generate edilecek
│   └── index.ts
└── middleware.ts
```

---

## 🔑 Önemli Notlar

### Supabase Auth Flow
1. Kullanıcı kayıt olur → Supabase `auth.users` tablosuna kayıt
2. Trigger çalışır → `profiles` tablosuna otomatik kayıt
3. Email confirmation (eğer aktifse)
4. Kullanıcı giriş yapar → Session token alır
5. Her request'te token ile auth kontrolü

### RLS (Row Level Security) Avantajları
- Backend API'ye gerek yok
- Database seviyesinde güvenlik
- Her kullanıcı sadece kendi verilerini görür
- SQL injection koruması

### Next.js 14+ App Router Özellikleri
- Server Components (varsayılan)
- Server Actions (form handling)
- Parallel Routes
- Route Groups

---

## 🚀 Başlangıç Sırası

**İlk önce:**
1. Supabase kurulumu ve RLS politikaları
2. Auth Context ve hooks
3. Login/Register sayfaları

**Sonra:**
4. Protected routes
5. Dashboard sayfası
6. Kullanıcı veri tabloları

**En son:**
7. Ekstra sayfalar ve özellikler
8. UI/UX iyileştirmeleri
9. Test ve deployment

---

## 📚 Faydalı Kaynaklar

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase + Next.js Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

**Başarılar! 🎉**
