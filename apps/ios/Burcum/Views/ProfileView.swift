import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @State private var activeAlert: ProfileAlert?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    profileHeader
                    subscriptionCard
                    settingsMenu
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
            .alert(item: $activeAlert) { alert in
                switch alert {
                case .logoutConfirm:
                    return Alert(
                        title: Text("Cikis Yap"),
                        message: Text("Hesabindan cikis yapmak istedigine emin misin?"),
                        primaryButton: .destructive(Text("Cikis Yap")) {
                            authManager.logout()
                        },
                        secondaryButton: .cancel(Text("Iptal"))
                    )
                case .deleteConfirm:
                    return Alert(
                        title: Text("Hesabi Kalici Olarak Sil"),
                        message: Text("Bu islem geri alinamaz. Tum verilerin ve uyeliginle iliskili bilgiler kalici olarak silinir."),
                        primaryButton: .destructive(Text("Hesabi Sil")) {
                            deleteAccount()
                        },
                        secondaryButton: .cancel(Text("Iptal"))
                    )
                case .deleteResult(let message):
                    return Alert(
                        title: Text("Hesap Silme"),
                        message: Text(message),
                        dismissButton: .default(Text("Tamam"))
                    )
                }
            }
        }
    }

    private var profileHeader: some View {
        VStack(spacing: 16) {
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

            VStack(spacing: 4) {
                Text(authManager.user?.name ?? "")
                    .font(.title2)
                    .fontWeight(.bold)

                Text(authManager.user?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }

            if let signStr = authManager.user?.zodiacSign,
               let sign = ZodiacSign(rawValue: signStr) {
                HStack {
                    Text(sign.turkishName)
                    Text("\u{2022}")
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
                    Text("Uyelik Durumu")
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
                    Text("Premium'a Gec")
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
        case .vip: return "VIP Uye"
        case .premium: return "Premium Uye"
        default: return "Ucretsiz"
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
            SettingsRow(icon: "lock.fill", title: "Gizlilik Politikasi", color: .green) {
                if let url = URL(string: "https://burcum.site/gizlilik") {
                    UIApplication.shared.open(url)
                }
            }

            Divider()
                .background(Color.white.opacity(0.1))

            SettingsRow(icon: "questionmark.circle.fill", title: "Yardim & Destek", color: .purple) {
                if let url = URL(string: "mailto:destek@burcum.site") {
                    UIApplication.shared.open(url)
                }
            }

            Divider()
                .background(Color.white.opacity(0.1))

            SettingsRow(icon: "arrow.clockwise", title: "Satin Almalari Geri Yukle", color: .cyan) {
                Task {
                    await subscriptionManager.restorePurchases()
                }
            }

            Divider()
                .background(Color.white.opacity(0.1))

            SettingsRow(icon: "trash.fill", title: "Hesabi Sil", color: .red) {
                activeAlert = .deleteConfirm
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        )
    }

    private var logoutButton: some View {
        Button {
            activeAlert = .logoutConfirm
        } label: {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Cikis Yap")
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

    private func deleteAccount() {
        Task {
            let success = await authManager.deleteAccount()
            if success {
                activeAlert = .deleteResult("Hesabin kalici olarak silindi.")
            } else {
                activeAlert = .deleteResult(authManager.error ?? "Hesap silinirken bir hata olustu.")
            }
        }
    }
}

private enum ProfileAlert: Identifiable {
    case logoutConfirm
    case deleteConfirm
    case deleteResult(String)

    var id: String {
        switch self {
        case .logoutConfirm:
            return "logout-confirm"
        case .deleteConfirm:
            return "delete-confirm"
        case .deleteResult(let message):
            return "delete-result-\(message)"
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
