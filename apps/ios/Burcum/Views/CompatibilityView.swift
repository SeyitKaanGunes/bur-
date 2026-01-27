import SwiftUI

struct CompatibilityView: View {
    @State private var sign1: ZodiacSign?
    @State private var sign2: ZodiacSign?
    @State private var result: CompatibilityResult?
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Title
                    VStack(spacing: 8) {
                        Text("Burç Uyumluluğu")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("İki burç arasındaki uyumu keşfet")
                            .foregroundColor(.gray)
                    }
                    .padding(.top)

                    // Sign Selectors
                    HStack(spacing: 20) {
                        SignSelector(
                            title: "Birinci Burç",
                            selectedSign: $sign1
                        )

                        Image(systemName: "heart.fill")
                            .font(.title)
                            .foregroundColor(.pink)

                        SignSelector(
                            title: "İkinci Burç",
                            selectedSign: $sign2
                        )
                    }
                    .padding()

                    // Calculate Button
                    Button(action: calculateCompatibility) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Uyumu Hesapla")
                                Image(systemName: "sparkles")
                            }
                        }
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [.pink, .purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    .disabled(sign1 == nil || sign2 == nil || isLoading)
                    .opacity(sign1 == nil || sign2 == nil ? 0.5 : 1)
                    .padding(.horizontal)

                    // Error
                    if let error = error {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }

                    // Result
                    if let result = result {
                        CompatibilityResultCard(result: result)
                            .transition(.scale.combined(with: .opacity))
                    }
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
        }
    }

    private func calculateCompatibility() {
        guard let s1 = sign1, let s2 = sign2 else { return }

        isLoading = true
        error = nil

        Task {
            do {
                let compatResult = try await APIClient.shared.getCompatibility(sign1: s1, sign2: s2)
                withAnimation {
                    result = compatResult
                }
            } catch {
                self.error = "Uyumluluk hesaplanamadı"
            }
            isLoading = false
        }
    }
}

struct SignSelector: View {
    let title: String
    @Binding var selectedSign: ZodiacSign?
    @State private var showPicker = false

    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)

            Button {
                showPicker = true
            } label: {
                VStack(spacing: 4) {
                    if let sign = selectedSign {
                        Text(sign.symbol)
                            .font(.system(size: 40))
                        Text(sign.turkishName)
                            .font(.caption)
                            .foregroundColor(.white)
                    } else {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.purple)
                        Text("Seç")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                .frame(width: 100, height: 100)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.ultraThinMaterial)
                )
            }
        }
        .sheet(isPresented: $showPicker) {
            SignPickerSheet(selectedSign: $selectedSign)
        }
    }
}

struct SignPickerSheet: View {
    @Binding var selectedSign: ZodiacSign?
    @Environment(\.dismiss) var dismiss

    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(ZodiacSign.allCases) { sign in
                        Button {
                            selectedSign = sign
                            dismiss()
                        } label: {
                            VStack(spacing: 8) {
                                Text(sign.symbol)
                                    .font(.system(size: 36))
                                Text(sign.turkishName)
                                    .font(.caption)
                                    .foregroundColor(.primary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 20)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(selectedSign == sign ? Color.purple.opacity(0.3) : Color.gray.opacity(0.1))
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(selectedSign == sign ? Color.purple : .clear, lineWidth: 2)
                            )
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Burç Seç")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Kapat") { dismiss() }
                }
            }
        }
    }
}

struct CompatibilityResultCard: View {
    let result: CompatibilityResult

    var body: some View {
        VStack(spacing: 20) {
            // Overall Score
            VStack(spacing: 8) {
                Text("Genel Uyum")
                    .font(.headline)
                    .foregroundColor(.gray)

                ZStack {
                    Circle()
                        .stroke(Color.purple.opacity(0.3), lineWidth: 8)
                        .frame(width: 120, height: 120)

                    Circle()
                        .trim(from: 0, to: CGFloat(result.overallScore) / 100)
                        .stroke(
                            LinearGradient(
                                colors: [.pink, .purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            style: StrokeStyle(lineWidth: 8, lineCap: .round)
                        )
                        .frame(width: 120, height: 120)
                        .rotationEffect(.degrees(-90))

                    VStack {
                        Text("\(result.overallScore)")
                            .font(.system(size: 36, weight: .bold))
                        Text("%")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
            }

            // Category Scores
            HStack(spacing: 16) {
                CategoryScore(label: "Aşk", score: result.loveScore, icon: "heart.fill", color: .pink)
                CategoryScore(label: "Arkadaşlık", score: result.friendshipScore, icon: "person.2.fill", color: .blue)
                CategoryScore(label: "İş", score: result.workScore, icon: "briefcase.fill", color: .orange)
            }

            // Analysis
            VStack(alignment: .leading, spacing: 12) {
                Text("Analiz")
                    .font(.headline)

                Text(result.analysis)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            // Strengths & Challenges
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Label("Güçlü Yanlar", systemImage: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundColor(.green)

                    ForEach(result.strengths, id: \.self) { item in
                        Text("• \(item)")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                VStack(alignment: .leading, spacing: 8) {
                    Label("Zorluklar", systemImage: "exclamationmark.triangle.fill")
                        .font(.caption)
                        .foregroundColor(.orange)

                    ForEach(result.challenges, id: \.self) { item in
                        Text("• \(item)")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Advice
            VStack(alignment: .leading, spacing: 8) {
                Text("Tavsiye")
                    .font(.headline)

                Text(result.advice)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(Color.purple.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(.ultraThinMaterial)
        )
        .padding()
    }
}

struct CategoryScore: View {
    let label: String
    let score: Int
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(color)

            Text("\(score)%")
                .font(.headline)

            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    CompatibilityView()
}
