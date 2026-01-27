import SwiftUI

struct HomeView: View {
    @State private var selectedSign: ZodiacSign?

    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Hero Section
                    heroSection

                    // Zodiac Grid
                    LazyVGrid(columns: columns, spacing: 16) {
                        ForEach(ZodiacSign.allCases) { sign in
                            NavigationLink(value: sign) {
                                ZodiacCardView(sign: sign)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
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
            .navigationDestination(for: ZodiacSign.self) { sign in
                ZodiacDetailView(sign: sign)
            }
        }
    }

    private var heroSection: some View {
        VStack(spacing: 16) {
            Text("Burcum")
                .font(.system(size: 42, weight: .bold, design: .serif))
                .foregroundStyle(
                    LinearGradient(
                        colors: [.purple, .pink],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )

            Text("Yıldızların Rehberliğinde")
                .font(.title3)
                .foregroundColor(.gray)

            Text("Burcunu seç ve günlük yorumunu keşfet")
                .font(.subheadline)
                .foregroundColor(.gray.opacity(0.8))
                .multilineTextAlignment(.center)
        }
        .padding(.top, 20)
    }
}

struct ZodiacCardView: View {
    let sign: ZodiacSign
    @State private var isPressed = false

    var body: some View {
        VStack(spacing: 8) {
            Text(sign.symbol)
                .font(.system(size: 36))

            Text(sign.turkishName)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.white)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            LinearGradient(
                                colors: [.purple.opacity(0.3), .clear],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                )
        )
        .scaleEffect(isPressed ? 0.95 : 1)
        .animation(.spring(response: 0.3), value: isPressed)
        .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthManager())
}
