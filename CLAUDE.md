# Burcum - AI Tabanlı Burç Uygulaması

Bu dosya, Claude Code'un bu proje üzerinde çalışırken kullanacağı talimatları içerir.

## Proje Özeti

**Burcum**, AI destekli kişiselleştirilmiş burç yorumları sunan multiplatform bir uygulamadır.

- **Web:** Next.js 14 (App Router) - Vercel'de deploy
- **iOS:** Swift + SwiftUI - App Store
- **Android:** Kotlin + Jetpack Compose - Play Store
- **Domain:** burcum.site
- **Dil:** Türkçe

## Teknoloji Stack

| Platform | Teknoloji |
|----------|-----------|
| Web | Next.js 14, Tailwind CSS, React Query |
| iOS | Swift 5.9, SwiftUI, StoreKit 2 |
| Android | Kotlin 1.9, Jetpack Compose, Billing Client |
| Database | Cloudflare D1 + Drizzle ORM |
| AI | Groq API (Llama 3.1 70B) |
| Email | Resend |
| Ödeme | StoreKit (iOS), Play Billing (Android) |

## Proje Yapısı

```
burc/
├── apps/
│   ├── web/                        # Next.js web uygulaması
│   │   ├── src/app/                # Sayfalar (App Router)
│   │   │   ├── (auth)/             # Kayıt, Giriş, Doğrulama
│   │   │   ├── burc/[sign]/        # Burç detay sayfası
│   │   │   ├── uyumluluk/          # Uyumluluk sayfası
│   │   │   ├── profil/             # Profil sayfası
│   │   │   ├── premium/            # Premium sayfası
│   │   │   └── api/                # API routes
│   │   ├── src/components/         # Header, ZodiacCard, Paywall vb.
│   │   └── src/lib/                # AI, Auth, Email servisleri
│   │
│   ├── ios/                        # Native iOS uygulaması
│   │   └── Burcum/
│   │       ├── BurcumApp.swift     # App entry point
│   │       ├── ContentView.swift   # Main TabView
│   │       ├── Models/             # ZodiacSign, HoroscopeReading
│   │       ├── Services/           # APIClient, AuthManager, SubscriptionManager
│   │       └── Views/              # HomeView, ZodiacDetailView, vb.
│   │
│   └── android/                    # Native Android uygulaması
│       └── app/src/main/java/com/burcum/app/
│           ├── BurcumApp.kt        # Application class
│           ├── MainActivity.kt     # Compose activity
│           ├── Navigation.kt       # NavHost yapısı
│           ├── model/              # Data classes
│           ├── ui/screens/         # Compose screens
│           └── ui/theme/           # Material 3 tema
│
├── packages/
│   ├── shared/                     # İş mantığı, tipler, şemalar, DB
│   ├── ui/                         # Button, Card, Input, ZodiacIcon
│   ├── api-client/                 # React Query hooks
│   └── astrology/                  # Burç hesaplama motoru
│
└── CLAUDE.md
```

## Tamamlanan Özellikler

### Faz 1: Temel Yapı ✅
- [x] Turborepo monorepo kurulumu
- [x] TypeScript, Tailwind CSS config
- [x] Shared packages (constants, types, schemas)
- [x] Drizzle ORM database şeması
- [x] UI component library

### Faz 2: Auth Sistemi ✅
- [x] Kayıt/Giriş API endpoints
- [x] Session yönetimi (cookie-based)
- [x] Password hashing (bcrypt)
- [x] Rate limiting (login attempts)
- [x] Email doğrulama (Resend templates)
- [x] Kayıt sayfası (burç tespiti ile)
- [x] Giriş sayfası
- [x] Profil sayfası

### Faz 3: Core Features ✅
- [x] Ana sayfa (burç grid, hero, premium CTA)
- [x] Burç detay sayfası (günlük/haftalık/aylık/yıllık yorum)
- [x] Uyumluluk sayfası
- [x] Groq AI entegrasyonu
- [x] Header component (auth durumu)
- [x] Premium sayfası (fiyatlandırma)
- [x] Soft paywall komponenti
- [x] Aylık/Yıllık yorum API'leri (Premium)

### Faz 4: Native Mobil Uygulamalar ✅
- [x] iOS uygulaması (Swift + SwiftUI)
  - HomeView, ZodiacDetailView, CompatibilityView
  - AuthView, ProfileView, PremiumView
  - APIClient, KeychainManager, AuthManager
  - SubscriptionManager (StoreKit 2)
- [x] Android uygulaması (Kotlin + Compose)
  - HomeScreen, ZodiacDetailScreen, CompatibilityScreen
  - AuthScreen, ProfileScreen, PremiumScreen
  - ApiClient, SecureStorage, AuthManager
  - SubscriptionManager (Play Billing)

## Önemli Dosyalar

### Web - Auth & Core
- `apps/web/src/lib/auth.ts` - Session, user yönetimi
- `apps/web/src/lib/email.ts` - Resend email servisi
- `apps/web/src/lib/ai.ts` - Groq AI entegrasyonu
- `apps/web/src/app/api/auth/` - Auth API routes
- `apps/web/src/app/api/horoscope/` - Burç yorum API'leri

### iOS
- `apps/ios/Burcum/Services/APIClient.swift` - API istekleri
- `apps/ios/Burcum/Services/AuthManager.swift` - Auth yönetimi
- `apps/ios/Burcum/Services/KeychainManager.swift` - Güvenli depolama
- `apps/ios/Burcum/Services/SubscriptionManager.swift` - StoreKit 2

### Android
- `apps/android/app/.../ApiClient.kt` - Retrofit API client
- `apps/android/app/.../AuthManager.kt` - Auth yönetimi
- `apps/android/app/.../SecureStorage.kt` - EncryptedSharedPreferences
- `apps/android/app/.../SubscriptionManager.kt` - Play Billing

### Shared Packages
- `packages/shared/src/constants/zodiac.ts` - Burç verileri
- `packages/shared/src/constants/subscription.ts` - Abonelik limitleri
- `packages/shared/src/utils/security.ts` - Güvenlik fonksiyonları
- `packages/shared/src/db/schema.ts` - Database şeması

## Komutlar

```bash
# Web Geliştirme
pnpm install          # Bağımlılıkları yükle
pnpm dev              # Web uygulamasını başlat (http://localhost:3000)
pnpm build            # Production build
pnpm lint             # Lint kontrolü
pnpm type-check       # TypeScript kontrolü

# iOS (Xcode gerekli)
cd apps/ios && open Burcum.xcodeproj

# Android (Android Studio gerekli)
cd apps/android && ./gradlew assembleDebug
```

## API Endpoint'leri

```
# Auth
POST /api/auth/register      - Kayıt
POST /api/auth/login         - Giriş
POST /api/auth/logout        - Çıkış
GET  /api/auth/me            - Mevcut kullanıcı
POST /api/auth/verify-email  - Email doğrulama

# Horoscope
GET  /api/horoscope/daily/[sign]    - Günlük yorum
GET  /api/horoscope/weekly/[sign]   - Haftalık yorum
GET  /api/horoscope/monthly/[sign]  - Aylık yorum (Premium)
GET  /api/horoscope/yearly/[sign]   - Yıllık yorum (Premium)

# Compatibility
POST /api/compatibility             - Uyumluluk analizi
```

## Environment Variables

```bash
# .env.local dosyasına ekle:
GROQ_API_KEY=xxx          # Groq API (zorunlu) - console.groq.com
AUTH_SECRET=xxx           # openssl rand -base64 32
RESEND_API_KEY=xxx        # Resend.com
EMAIL_FROM=noreply@burcum.site
```

## Abonelik Katmanları

| Özellik | FREE | PREMIUM (₺29.99/ay) | VIP (₺49.99/ay) |
|---------|------|---------------------|-----------------|
| Günlük okuma | 3/gün | ∞ | ∞ |
| Haftalık yorum | 1/hafta | ∞ | ∞ |
| Aylık yorum | ❌ | ✅ | ✅ |
| Yıllık yorum | ❌ | ✅ | ✅ |
| Uyumluluk | 2/gün | ∞ | ∞ |
| Reklam | Var | Yok | Yok |
| AI danışman | ❌ | ❌ | ✅ |

## Güvenlik Kuralları

1. **SQL Injection:** Drizzle ORM parameterized queries
2. **Prompt Injection:** `sanitizeUserInput()` + topic whitelist
3. **Password:** bcrypt (cost factor 12)
4. **Rate Limiting:** IP bazlı (login: 5/15dk, API: 30/dk)
5. **Validation:** Zod schemas
6. **Session:** HttpOnly, Secure, SameSite cookies
7. **iOS:** Keychain ile token/user saklama
8. **Android:** EncryptedSharedPreferences

## Sonraki Adımlar

- [x] Cloudflare D1 database bağlantısı (Drizzle ORM entegrasyonu hazır)
- [x] Vercel deployment hazırlığı (vercel.json, env.example)
- [ ] Wrangler ile D1 database oluşturma ve migration
- [ ] Vercel'e deploy
- [ ] Push notifications (iOS + Android)
- [ ] App Store Connect & Google Play Console kurulumu
- [ ] In-App Purchase ürünleri oluşturma
- [ ] App Store / Play Store submit

## Deployment

Detaylı deployment talimatları için: `DEPLOYMENT.md`

### Hızlı Başlangıç

```bash
# 1. Bağımlılıkları yükle
pnpm install

# 2. Environment variables ayarla
cp apps/web/.env.example apps/web/.env.local
# .env.local dosyasını düzenle

# 3. Development server başlat
pnpm dev

# 4. Production build
pnpm build
```

## Stil Rehberi

- Kozmik tema: mor (#8b5cf6), indigo (#6366f1)
- Glass morphism: `bg-white/5 backdrop-blur-md border-white/10`
- Gradient text: `gradient-text` class
- Animasyonlar: float, twinkle, pulse-slow
- Responsive: mobile-first
- Font: Inter (body), Playfair Display (headings)

## App Store Bilgileri

### iOS
- Bundle ID: `com.burcum.app`
- Min iOS: 17.0
- Dil: Türkçe

### Android
- Package: `com.burcum.app`
- Min SDK: 26 (Android 8.0)
- Target SDK: 34

### In-App Purchase IDs
- `com.burcum.premium.monthly`
- `com.burcum.premium.yearly`
- `com.burcum.vip.monthly`
- `com.burcum.vip.yearly`

## Kaynaklar

- [Groq API](https://console.groq.com/docs)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Resend](https://resend.com/docs)
- [StoreKit 2](https://developer.apple.com/storekit/)
- [Play Billing](https://developer.android.com/google/play/billing)
