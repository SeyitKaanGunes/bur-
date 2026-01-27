import SwiftUI

struct ZodiacDetailView: View {
    let sign: ZodiacSign

    @EnvironmentObject var authManager: AuthManager
    @State private var selectedTab: ReadingType = .daily
    @State private var reading: HoroscopeReading?
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                headerSection

                // Tab Selector
                tabSelector

                // Content
                contentSection
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
        .navigationTitle(sign.turkishName)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadReading()
        }
        .onChange(of: selectedTab) { _, _ in
            Task { await loadReading() }
        }
    }

    private var headerSection: some View {
        VStack(spacing: 12) {
            Text(sign.symbol)
                .font(.system(size: 72))

            Text(sign.turkishName)
                .font(.largeTitle)
                .fontWeight(.bold)

            Text(sign.dateRange)
                .font(.subheadline)
                .foregroundColor(.gray)

            HStack(spacing: 16) {
                Label(sign.element.turkishName, systemImage: elementIcon)
                    .font(.caption)
                    .foregroundColor(.purple)
            }
        }
    }

    private var elementIcon: String {
        switch sign.element {
        case .fire: return "flame.fill"
        case .earth: return "leaf.fill"
        case .air: return "wind"
        case .water: return "drop.fill"
        }
    }

    private var tabSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach([ReadingType.daily, .weekly, .monthly, .yearly], id: \.self) { type in
                    TabButton(
                        title: tabTitle(for: type),
                        isSelected: selectedTab == type,
                        isPremium: isPremiumTab(type)
                    ) {
                        selectedTab = type
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    private func tabTitle(for type: ReadingType) -> String {
        switch type {
        case .daily: return "Günlük"
        case .weekly: return "Haftalık"
        case .monthly: return "Aylık"
        case .yearly: return "Yıllık"
        }
    }

    private func isPremiumTab(_ type: ReadingType) -> Bool {
        (type == .monthly || type == .yearly) && !authManager.isPremium
    }

    private var contentSection: some View {
        Group {
            if isPremiumTab(selectedTab) {
                PaywallCard(type: selectedTab)
            } else if isLoading {
                LoadingView()
            } else if let error = error {
                ErrorCard(message: error) {
                    Task { await loadReading() }
                }
            } else if let reading = reading {
                ReadingCard(reading: reading, type: selectedTab)
            }
        }
    }

    private func loadReading() async {
        isLoading = true
        error = nil

        do {
            switch selectedTab {
            case .daily:
                reading = try await APIClient.shared.getDailyHoroscope(sign: sign)
            case .weekly:
                reading = try await APIClient.shared.getWeeklyHoroscope(sign: sign)
            case .monthly:
                reading = try await APIClient.shared.getMonthlyHoroscope(sign: sign)
            case .yearly:
                reading = try await APIClient.shared.getYearlyHoroscope(sign: sign)
            }
        } catch let apiError as APIError {
            error = apiError.errorDescription
        } catch {
            self.error = "Yorum yüklenemedi"
        }

        isLoading = false
    }
}

struct TabButton: View {
    let title: String
    let isSelected: Bool
    let isPremium: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(title)
                if isPremium {
                    Text("Premium")
                        .font(.system(size: 8))
                        .foregroundColor(.amber)
                }
            }
            .font(.subheadline)
            .fontWeight(.medium)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                Group {
                    if isSelected {
                        LinearGradient(
                            colors: [.indigo, .purple],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    } else if isPremium {
                        Color.purple.opacity(0.2)
                    } else {
                        Color.white.opacity(0.1)
                    }
                }
            )
            .foregroundColor(isPremium && !isSelected ? .purple : .white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isPremium ? Color.purple.opacity(0.5) : .clear, lineWidth: 1)
            )
        }
    }
}

struct ReadingCard: View {
    let reading: HoroscopeReading
    let type: ReadingType

    var typeLabel: String {
        switch type {
        case .daily: return "Günün"
        case .weekly: return "Haftanın"
        case .monthly: return "Ayın"
        case .yearly: return "Yılın"
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Main Content
            Text(reading.content)
                .font(.body)
                .lineSpacing(6)

            // Advice
            if let advice = reading.advice {
                VStack(alignment: .leading, spacing: 8) {
                    Text("\(typeLabel) Tavsiyesi")
                        .font(.caption)
                        .foregroundColor(.gray)

                    Text(advice)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            // Scores
            if let love = reading.loveScore,
               let career = reading.careerScore,
               let health = reading.healthScore {
                HStack(spacing: 16) {
                    ScoreView(label: "Aşk", score: love, color: .pink)
                    ScoreView(label: "Kariyer", score: career, color: .indigo)
                    ScoreView(label: "Sağlık", score: health, color: .green)
                }
            }

            // Lucky Items
            HStack {
                if let numbers = reading.luckyNumbers {
                    VStack {
                        Text("Şanslı Sayılar")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Text(numbers.map(String.init).joined(separator: ", "))
                            .fontWeight(.semibold)
                    }
                }

                Spacer()

                if let color = reading.luckyColor {
                    VStack {
                        Text("Şanslı Renk")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Text(color)
                            .fontWeight(.semibold)
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        )
    }
}

struct ScoreView: View {
    let label: String
    let score: Int
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)

            ZStack {
                Circle()
                    .stroke(color.opacity(0.3), lineWidth: 4)

                Circle()
                    .trim(from: 0, to: CGFloat(score) / 10)
                    .stroke(color, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .rotationEffect(.degrees(-90))

                Text("\(score)")
                    .font(.headline)
                    .fontWeight(.bold)
            }
            .frame(width: 50, height: 50)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct PaywallCard: View {
    let type: ReadingType

    var title: String {
        type == .monthly ? "Aylık Yorum" : "Yıllık Yorum"
    }

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "lock.fill")
                .font(.largeTitle)
                .foregroundColor(.purple)

            Text("\(title) Premium Özelliğidir")
                .font(.headline)

            Text("Detaylı analizler, öngörüler ve tavsiyeler için Premium'a geç.")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)

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
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        )
    }
}

struct LoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
                .tint(.purple)

            Text("Yorum yükleniyor...")
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(40)
    }
}

struct ErrorCard: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.red)

            Text(message)
                .foregroundColor(.gray)

            Button("Tekrar Dene", action: retry)
                .foregroundColor(.purple)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        )
    }
}

// Amber color extension
extension Color {
    static let amber = Color(red: 0.96, green: 0.76, blue: 0.18)
}

#Preview {
    NavigationStack {
        ZodiacDetailView(sign: .aslan)
    }
    .environmentObject(AuthManager())
}
