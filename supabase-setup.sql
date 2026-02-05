-- ============================================
-- HESABIM APP - TEMİZ KURULUM (SIFIRDAN)
-- ============================================
-- Önce Supabase Table Editor'dan mevcut tabloları sil:
-- 1. transactions
-- 2. categories  
-- 3. profiles (varsa)
-- Sonra bu SQL'i çalıştır.

-- ============================================
-- 1. PROFILES TABLOSU (Kullanıcı Bilgileri)
-- ============================================
-- NOT: email ve password için auth.users kullanılıyor (Supabase yönetiyor)
-- Bu tabloda sadek ek bilgiler tutuluyor: name, surname

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  surname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Her kullanıcı sadece kendi profilini görebilir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. OTOMATIK PROFIL OLUŞTURMA (Trigger)
-- ============================================
-- Kayıt olunca otomatik profil oluşturur

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, surname)
  VALUES (NEW.id, NEW.email, '', '')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Önce mevcut trigger'ı sil (varsa), sonra yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. CATEGORIES TABLOSU (Gelir/Gider Kategorileri)
-- ============================================

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS - Giriş yapan herkes kategori görebilir
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Varsayılan kategoriler
INSERT INTO categories (name, type, icon, color) VALUES
  -- Gelir Kategorileri
  ('Maaş', 'income', '💰', '#10b981'),
  ('Freelance', 'income', '💻', '#059669'),
  ('Yatırım', 'income', '📈', '#34d399'),
  ('Hediye', 'income', '🎁', '#6ee7b7'),
  ('Diğer Gelir', 'income', '➕', '#a7f3d0'),
  
  -- Gider Kategorileri
  ('Market', 'expense', '🛒', '#ef4444'),
  ('Kira', 'expense', '🏠', '#dc2626'),
  ('Ulaşım', 'expense', '🚗', '#f87171'),
  ('Faturalar', 'expense', '📄', '#fca5a5'),
  ('Yemek', 'expense', '🍔', '#fb923c'),
  ('Eğlence', 'expense', '🎬', '#f59e0b'),
  ('Sağlık', 'expense', '💊', '#ef4444'),
  ('Giyim', 'expense', '👕', '#ec4899'),
  ('Diğer Gider', 'expense', '➖', '#fbbf24');

-- ============================================
-- 4. TRANSACTIONS TABLOSU (Gelir/Gider İşlemleri)
-- ============================================

CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS - Her kullanıcı sadece kendi işlemlerini görebilir
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

-- ============================================
-- ✅ KURULUM TAMAMLANDI!
-- ============================================
-- Şimdi yapılacaklar:
-- 1. Authentication > Providers > Email'i aktif et
-- 2. npm run dev ile uygulamayı başlat
-- 3. /register sayfasından kayıt ol (email + password)
-- 4. /login ile giriş yap
-- 5. Ana sayfayı kullan!

-- NOT: Şifreler auth.users içinde hash'lenmiş şekilde saklanıyor (güvenli)
