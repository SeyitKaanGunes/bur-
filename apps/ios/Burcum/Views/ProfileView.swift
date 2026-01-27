import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @State private var showLogoutAlert = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Header
                    profileHeader

                    // Subscription Status
                    subscriptionCard

                    // Settings Menu
                    settingsMenu

                    // Logout Button
                    logoutButton
                }
                .padding()
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
            .navigationTitle("Profil")
            .alert("Çıkış Yap", isPresented: $showLogoutAlert) {
                Button("İptal", role: .cancel) {}
                Button("Çıkış Yap", role: .destructive) {
                    authManager.logout()
                }
            } message: {
                Text("Hesabından çıkış yapmak istediğine emin misin?")
            }
        }
    }

    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.purple, .indigo],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 100, height: 100)

                if let sign = authManager.user?.zodiacSign,
                   let zodiac = ZodiacSign(rawValue: sign) {
                    Text(zodiac.symbol)
                        .font(.system(size: 44))
                } else {
                    Image(systemName: "person.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.white)
                }
            }

            // Name & Email
            VStack(spacing: 4) {
                if let name = authManager.user?.name {
                    Text(name)
                        .font(.title2)
                        .fontWeight(.bold)
                }

                Text(authManager.user?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }

            // Zodiac Info
            if let signStr = authManager.user?.zodiacSign,
               let sign = ZodiacSign(rawValue: signStr) {
                HStack {
                    Text(sign.turkishName)
                    Text("•")
                        .foregroundColor(.gray)
                    Text(sign.dateRange)
                }
                .font(.caption)
                .foregroundColor(.purple)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        )
    }

    private var subscriptionCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Üyelik Durumu")
                        .font(.caption)
                        .foregroundColor(.gray)

                    Text(subscriptionLabel)
                        .font(.headline)
                        .foregroundColor(subscriptionColor)
                }

                Spacer()

                Image(systemName: subscriptionIcon)
                    .font(.title)
                    .foregroundColor(subscriptionColor)
            }

            if !authManager.isPremium {
                NavigationLink(destination: PremiumView()) {
                    Text("Premium'a Geç")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [.purple, .indigo],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        )
    }

    private var subscriptionLabel: String {
        switch authManager.user?.subscriptionTier {
        case .vip: return "VIP Üye"
        case .premium: return "Premium Üye"
        default: return "Ücretsiz"
        }
    }

    private var subscriptionColor: Color {
        switch authManager.user?.subscriptionTier {
        case .vip: return .amber
        case .premium: return .purple
        default: return .gray
        }
    }

    private var subscriptionIcon: String {
        switch authManager.user?.subscriptionTier {
        case .vip: return "crown.fill"
        case .premium: return "star.fill"
        default: return "person.fill"
        }
    }

    private var settingsMenu: some View {
        VStack(spacing: 0) {
            SettingsRow(icon: "bell.fill", title: "Bildirimler", color: .orange) {
                // Push to notifications settings
            }

            Divider()
                .background(Color.white.opacity(0.1))

            SettingsRow(icon: "envelope.fill", title: "E-posta Tercihleri", color: .blue) {
                // Push to email settings
            }

            Divider()
                .background(Color.white.opacity(0.1))

            SettingsRow(icon: "lock.fill", title: "Gizlilik", color: .green) {
                // Push to privacy settings
            }

            Divider()
                .background(Color.white.opacity(0.1))

            SettingsRow(icon: "questionmark.circle.fill", title: "Yardım & Destek", color: .purple) {
                // Push to help
            }

            Divider()
                .background(Color.white.opacity(0.1))

            SettingsRow(icon: "arrow.clockwise", title: "Satın Almaları Geri Yükle", color: .cyan) {
                Task {
                    await subscriptionManager.restorePurchases()
                }
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        )
    }

    private var logoutButton: some View {
        Button {
            showLogoutAlert = true
        } label: {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Çıkış Yap")
            }
            .foregroundColor(.red)
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(.ultraThinMaterial)
            )
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .frame(width: 30)

                Text(title)
                    .foregroundColor(.white)

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.gray)
                    .font(.caption)
            }
            .padding()
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthManager())
        .environmentObject(SubscriptionManager())
}
