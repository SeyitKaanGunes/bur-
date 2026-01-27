# Burcum Deployment Rehberi

Bu dokümanda Burcum uygulamasının production'a deploy edilmesi için gerekli adımlar anlatılmaktadır.

## 1. Gereksinimler

- Node.js 18+
- pnpm 8+
- Cloudflare hesabı (D1 database için)
- Vercel hesabı (web hosting için)
- Resend hesabı (email için)
- Groq hesabı (AI için)
- Apple Developer hesabı (iOS için, $99/yıl)
- Google Play Developer hesabı (Android için, $25 tek seferlik)

## 2. Cloudflare D1 Database Kurulumu

### 2.1 Wrangler CLI Kurulumu

```bash
npm install -g wrangler
wrangler login
```

### 2.2 D1 Database Oluşturma

```bash
cd apps/web
wrangler d1 create burcum-db
```

Çıktıdaki `database_id` değerini `wrangler.toml` dosyasına yapıştırın.

### 2.3 Database Schema'yı Uygulama

```bash
cd packages/shared

# Migration dosyaları oluştur
pnpm db:generate

# Schema'yı database'e uygula (production)
pnpm db:push
```

## 3. Vercel Deployment

### 3.1 Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 3.2 Projeyi Deploy Et

```bash
cd apps/web
vercel
```

### 3.3 Environment Variables (Vercel Dashboard)

Vercel Dashboard > Project Settings > Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `GROQ_API_KEY` | `gsk_xxx...` | Production |
| `AUTH_SECRET` | `openssl rand -base64 32` | Production |
| `RESEND_API_KEY` | `re_xxx...` | Production |
| `EMAIL_FROM` | `noreply@burcum.site` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://burcum.site` | Production |

### 3.4 Domain Ayarları

Vercel Dashboard > Domains > Add Domain > `burcum.site`

DNS ayarları:
- A Record: `76.76.21.21`
- CNAME: `cname.vercel-dns.com`

## 4. iOS App Store Deployment

### 4.1 Xcode Ayarları

1. `apps/ios/Burcum.xcodeproj` dosyasını açın
2. Signing & Capabilities:
   - Team: Apple Developer hesabınız
   - Bundle Identifier: `com.burcum.app`
3. In-App Purchase capability ekleyin

### 4.2 App Store Connect

1. https://appstoreconnect.apple.com adresine gidin
2. "My Apps" > "+" > "New App"
3. App bilgilerini doldurun:
   - Name: Burcum
   - Primary Language: Turkish
   - Bundle ID: `com.burcum.app`
   - SKU: `burcum-ios-v1`

### 4.3 In-App Purchases

App Store Connect > In-App Purchases > "+" :

| Product ID | Type | Price |
|------------|------|-------|
| `com.burcum.premium.monthly` | Auto-Renewable | ₺29.99 |
| `com.burcum.premium.yearly` | Auto-Renewable | ₺299.99 |
| `com.burcum.vip.monthly` | Auto-Renewable | ₺49.99 |
| `com.burcum.vip.yearly` | Auto-Renewable | ₺499.99 |

### 4.4 Build & Upload

```bash
# Xcode'da
Product > Archive > Distribute App > App Store Connect
```

## 5. Google Play Store Deployment

### 5.1 Android Studio Build

```bash
cd apps/android

# Release keystore oluştur (ilk seferinde)
keytool -genkey -v -keystore burcum-release.keystore -alias burcum -keyalg RSA -keysize 2048 -validity 10000

# Release APK/AAB oluştur
./gradlew bundleRelease
```

### 5.2 Google Play Console

1. https://play.google.com/console adresine gidin
2. "Create app"
3. App bilgilerini doldurun:
   - App name: Burcum
   - Default language: Turkish

### 5.3 In-App Products

Play Console > Monetize > Products > Subscriptions:

| Product ID | Price |
|------------|-------|
| `com.burcum.premium.monthly` | ₺29.99 |
| `com.burcum.premium.yearly` | ₺299.99 |
| `com.burcum.vip.monthly` | ₺49.99 |
| `com.burcum.vip.yearly` | ₺499.99 |

### 5.4 Upload AAB

Production > Releases > Create new release > Upload AAB

## 6. Post-Deployment Checklist

- [ ] Web sitesi çalışıyor (https://burcum.site)
- [ ] API endpoint'leri çalışıyor
- [ ] Email doğrulama çalışıyor
- [ ] AI yorumları üretiliyor
- [ ] iOS uygulama TestFlight'ta test edildi
- [ ] Android uygulama Internal Testing'de test edildi
- [ ] In-App Purchase'lar sandbox'ta test edildi
- [ ] Analytics kuruldu (Plausible/Vercel Analytics)
- [ ] Error tracking kuruldu (Sentry - optional)

## 7. Monitoring

### Vercel Analytics
- Vercel Dashboard > Analytics

### Cloudflare D1
- Cloudflare Dashboard > D1 > burcum-db > Metrics

### App Store / Play Store
- App Store Connect > Analytics
- Google Play Console > Statistics

## 8. Troubleshooting

### D1 Database Bağlantı Hatası
```bash
wrangler d1 execute burcum-db --command "SELECT 1"
```

### Vercel Build Hatası
```bash
vercel logs --follow
```

### iOS Build Hatası
- Xcode > Product > Clean Build Folder
- Delete DerivedData folder

### Android Build Hatası
```bash
./gradlew clean
./gradlew assembleRelease --stacktrace
```
