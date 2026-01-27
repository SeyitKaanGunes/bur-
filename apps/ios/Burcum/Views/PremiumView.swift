import SwiftUI

struct PremiumView: View {
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @State private var isYearly = true
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 12) {
                    Text("✨")
                        .font(.system(size: 60))

                    Text("Premium'a Geç")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("Sınırsız erişim, detaylı yorumlar ve kişisel AI danışman")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                }
                .padding(.top)

                // Period Toggle
                Picker("Dönem", selection: $isYearly) {
                    Text("Aylık").tag(false)
                    Text("Yıllık (2 ay bedava)").tag(true)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                // Plans
                VStack(spacing: 16) {
                    PlanCard(
                        title: "Premium",
                        price: isYearly ? "₺299.99/yıl" : "₺29.99/ay",
                        originalPrice: isYearly ? "₺359.88" : nil,
                        features: [
                            "Sınırsız günlük okuma",
                            "Haftalık ve aylık yorumlar",
                            "Detaylı uyumluluk analizi",
                            "Reklamsız deneyim"
                        ],
                        color: .purple,
                        product: isYearly ? subscriptionManager.premiumYearly : subscriptionManager.premiumMonthly
                    )

                    PlanCard(
                        title: "VIP",
                        price: isYearly ? "₺499.99/yıl" : "₺49.99/ay",
                        originalPrice: isYearly ? "₺599.88" : nil,
                        features: [
                            "Premium'un tüm özellikleri",
                            "Yıllık detaylı yorumlar",
                            "Kişisel AI astroloji danışmanı",
                            "Öncelikli destek"
                        ],
                        color: .amber,
                        isHighlighted: true,
                        product: isYearly ? subscriptionManager.vipYearly : subscriptionManager.vipMonthly
                    )
                }
                .padding(.horizontal)

                // Features List
                VStack(alignment: .leading, spacing: 16) {
                    Text("Premium Avantajları")
                        .font(.headline)

                    FeatureRow(icon: "infinity", title: "Sınırsız Okuma", description: "Günlük limit yok")
                    FeatureRow(icon: "calendar", title: "Aylık & Yıllık", description: "Detaylı dönemsel yorumlar")
                    FeatureRow(icon: "brain.head.profile", title: "AI Danışman", description: "Kişisel astroloji asistanı")
                    FeatureRow(icon: "xmark.circle", title: "Reklamsız", description: "Kesintisiz deneyim")
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.ultraThinMaterial)
                )
                .padding(.horizontal)

                // Restore Purchases
                Button("Satın Almaları Geri Yükle") {
                    Task {
                        await subscriptionManager.restorePurchases()
                    }
                }
                .font(.caption)
                .foregroundColor(.gray)

                // Terms
                Text("Abonelik otomatik yenilenir. İstediğiniz zaman App Store ayarlarından iptal edebilirsiniz.")
                    .font(.caption2)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            .padding(.bottom, 40)
        }
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.1, green: 0.05, blue: 0.2),
                    Color(red: 0.05, green: 0.02, blue: 0.1)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct PlanCard: View {
    let title: String
    let price: String
    let originalPrice: String?
    let features: [String]
    let color: Color
    var isHighlighted: Bool = false
    let product: Product?

    @EnvironmentObject var subscriptionManager: SubscriptionManager

    var body: some View {
        VStack(spacing: 16) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if isHighlighted {
                        Text("EN POPÜLER")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(color)
                            .clipShape(Capsule())
                    }

                    Text(title)
                        .font(.title2)
                        .fontWeight(.bold)
                }

                Spacer()

                VStack(alignment: .trailing) {
                    if let original = originalPrice {
                        Text(original)
                            .font(.caption)
                            .strikethrough()
                            .foregroundColor(.gray)
                    }
                    Text(price)
                        .font(.headline)
                        .foregroundColor(color)
                }
            }

            Divider()
                .background(Color.white.opacity(0.2))

            // Features
            VStack(alignment: .leading, spacing: 8) {
                ForEach(features, id: \.self) { feature in
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(color)
                            .font(.caption)

                        Text(feature)
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            // Buy Button
            Button {
                if let product = product {
                    Task {
                        _ = await subscriptionManager.purchase(product)
                    }
                }
            } label: {
                HStack {
                    if subscriptionManager.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Satın Al")
                    }
                }
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .padding()
                .background(color)
                .foregroundColor(isHighlighted ? .black : .white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(product == nil || subscriptionManager.isLoading)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(isHighlighted ? color : .clear, lineWidth: 2)
                )
        )
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.purple)
                .frame(width: 40)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .fontWeight(.medium)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            Spacer()
        }
    }
}

#Preview {
    NavigationStack {
        PremiumView()
    }
    .environmentObject(SubscriptionManager())
}
