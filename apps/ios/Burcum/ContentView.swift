import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "sparkles")
                    Text("Burçlar")
                }
                .tag(0)

            RitualCoachView()
                .tabItem {
                    Image(systemName: "checklist")
                    Text("Rituel")
                }
                .tag(1)

            CompatibilityView()
                .tabItem {
                    Image(systemName: "heart.fill")
                    Text("Uyumluluk")
                }
                .tag(2)

            if authManager.isAuthenticated {
                ProfileView()
                    .tabItem {
                        Image(systemName: "person.fill")
                        Text("Profil")
                    }
                    .tag(3)
            } else {
                AuthView()
                    .tabItem {
                        Image(systemName: "person.fill")
                        Text("Giriş")
                    }
                    .tag(3)
            }
        }
        .tint(.purple)
    }
}

private enum RitualFocusArea: String, CaseIterable, Codable, Identifiable {
    case career
    case relationship
    case health
    case finance

    var id: String { rawValue }

    var title: String {
        switch self {
        case .career: return "Kariyer"
        case .relationship: return "Iliski"
        case .health: return "Saglik"
        case .finance: return "Finans"
        }
    }

    var icon: String {
        switch self {
        case .career: return "briefcase.fill"
        case .relationship: return "heart.fill"
        case .health: return "figure.run"
        case .finance: return "chart.line.uptrend.xyaxis"
        }
    }

    var reflectionPrompt: String {
        switch self {
        case .career:
            return "Bugun kariyer hedefin icin hangi somut adimi attin?"
        case .relationship:
            return "Bugun iletisimde hangi noktada daha bilincli davrandin?"
        case .health:
            return "Bugun bedenin ve zihin durumun hakkinda ne fark ettin?"
        case .finance:
            return "Bugun finansal disiplinini guclendiren hangi davranisi yaptin?"
        }
    }
}

private struct RitualTask: Codable, Identifiable {
    let id: UUID
    let title: String
    var isCompleted: Bool

    init(id: UUID = UUID(), title: String, isCompleted: Bool = false) {
        self.id = id
        self.title = title
        self.isCompleted = isCompleted
    }
}

private struct RitualDayRecord: Codable {
    let dateKey: String
    let zodiacSign: String
    var goal: String
    var focusArea: RitualFocusArea
    var tasks: [RitualTask]
    var reflectionPrompt: String
    var reflectionNote: String
    var mood: Int
    var updatedAt: Date

    var completionRate: Double {
        guard !tasks.isEmpty else { return 0 }
        let completedCount = tasks.filter { $0.isCompleted }.count
        return Double(completedCount) / Double(tasks.count)
    }

    var alignmentScore: Int {
        let completionScore = completionRate * 70
        let moodScore = (Double(mood) / 5.0) * 30
        return Int((completionScore + moodScore).rounded())
    }
}

private final class RitualCoachStore: ObservableObject {
    @Published private(set) var records: [String: RitualDayRecord] = [:]

    private let storageKey = "ritual_coach_records_v1"

    init() {
        load()
    }

    func todayKey() -> String {
        Self.dayKey(from: Date())
    }

    func record(for key: String) -> RitualDayRecord? {
        records[key]
    }

    func generateTodayPlan(goal: String, focusArea: RitualFocusArea, zodiacSign: ZodiacSign) {
        let key = todayKey()
        let normalizedGoal = goal.trimmingCharacters(in: .whitespacesAndNewlines)
        let tasks = buildTasks(goal: normalizedGoal, focusArea: focusArea, zodiacSign: zodiacSign)

        let previousNote = records[key]?.reflectionNote ?? ""
        let previousMood = records[key]?.mood ?? 3

        records[key] = RitualDayRecord(
            dateKey: key,
            zodiacSign: zodiacSign.rawValue,
            goal: normalizedGoal,
            focusArea: focusArea,
            tasks: tasks,
            reflectionPrompt: focusArea.reflectionPrompt,
            reflectionNote: previousNote,
            mood: previousMood,
            updatedAt: Date()
        )

        persist()
    }

    func setTaskCompleted(dateKey: String, taskId: UUID, isCompleted: Bool) {
        guard var record = records[dateKey] else { return }
        guard let idx = record.tasks.firstIndex(where: { $0.id == taskId }) else { return }
        record.tasks[idx].isCompleted = isCompleted
        record.updatedAt = Date()
        records[dateKey] = record
        persist()
    }

    func updateMood(dateKey: String, mood: Int) {
        guard var record = records[dateKey] else { return }
        record.mood = min(max(mood, 1), 5)
        record.updatedAt = Date()
        records[dateKey] = record
        persist()
    }

    func updateReflection(dateKey: String, note: String) {
        guard var record = records[dateKey] else { return }
        record.reflectionNote = note
        record.updatedAt = Date()
        records[dateKey] = record
        persist()
    }

    func last7DayScores() -> [(day: String, score: Int)] {
        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "tr_TR")
        formatter.dateFormat = "EEE"

        return (0..<7).compactMap { offset -> (String, Int)? in
            guard let date = calendar.date(byAdding: .day, value: -offset, to: Date()) else { return nil }
            let key = Self.dayKey(from: date)
            let dayLabel = formatter.string(from: date).capitalized
            let score = records[key]?.alignmentScore ?? 0
            return (dayLabel, score)
        }
        .reversed()
    }

    static func dayKey(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    private func buildTasks(goal: String, focusArea: RitualFocusArea, zodiacSign: ZodiacSign) -> [RitualTask] {
        let goalText = goal.isEmpty ? "ana hedefin" : "\"\(goal)\" hedefin"
        let elementHint: String

        switch zodiacSign.element {
        case .fire:
            elementHint = "kisa ve cesur bir hamle"
        case .earth:
            elementHint = "duzenli ve olculebilir bir adim"
        case .air:
            elementHint = "iletisim odakli bir aksiyon"
        case .water:
            elementHint = "sezgisel ama net bir hareket"
        }

        let focusAction: String
        switch focusArea {
        case .career:
            focusAction = "is planina 20 dakikalik derin odak ekle"
        case .relationship:
            focusAction = "onemli bir kisiyle acik bir konusma yap"
        case .health:
            focusAction = "bedenini destekleyen 30 dakikalik rutin uygula"
        case .finance:
            focusAction = "gunluk harcama kaydi tut ve bir gereksiz kalemi azalt"
        }

        return [
            RitualTask(title: "\(goalText) icin bugun \(elementHint) belirle."),
            RitualTask(title: "Rituel adimi: \(focusAction)."),
            RitualTask(title: "Gun sonu 5 dakikada sonucu degerlendir ve not al.")
        ]
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else { return }
        guard let decoded = try? JSONDecoder().decode([String: RitualDayRecord].self, from: data) else { return }
        records = decoded
    }
}

private struct RitualCoachView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var store = RitualCoachStore()
    @State private var goal = ""
    @State private var selectedFocus: RitualFocusArea = .career
    @State private var reflectionText = ""

    private var todayKey: String { store.todayKey() }
    private var todayRecord: RitualDayRecord? { store.record(for: todayKey) }
    private var currentSign: ZodiacSign {
        if let signRaw = authManager.user?.zodiacSign,
           let sign = ZodiacSign(rawValue: signRaw) {
            return sign
        }
        return .koc
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    VStack(spacing: 8) {
                        Text("Rituel Kocu")
                            .font(.largeTitle.bold())
                        Text("\(currentSign.symbol) \(currentSign.turkishName) icin kisisel gunluk plan")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .padding(.top, 12)

                    ritualSetupCard
                    todayPlanCard
                    progressCard
                }
                .padding()
                .padding(.bottom, 28)
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
            .onAppear {
                hydrateFromToday()
            }
        }
    }

    private var ritualSetupCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Haftalik Hedef")
                .font(.headline)

            TextField("Ornek: Is degisikligi icin portfolyo bitir", text: $goal)
                .textInputAutocapitalization(.sentences)
                .padding()
                .background(Color.white.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 12))

            Picker("Odak", selection: $selectedFocus) {
                ForEach(RitualFocusArea.allCases) { area in
                    Label(area.title, systemImage: area.icon).tag(area)
                }
            }
            .pickerStyle(.menu)

            Button {
                store.generateTodayPlan(goal: goal, focusArea: selectedFocus, zodiacSign: currentSign)
                hydrateFromToday()
            } label: {
                Text(todayRecord == nil ? "Bugunun Planini Olustur" : "Plani Yenile")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(colors: [.purple, .indigo], startPoint: .leading, endPoint: .trailing)
                    )
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 18).fill(.ultraThinMaterial))
    }

    private var todayPlanCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Bugunun Aksiyonlari")
                    .font(.headline)
                Spacer()
                Text("%\(todayRecord?.alignmentScore ?? 0)")
                    .font(.headline)
                    .foregroundColor(.amber)
            }

            if let record = todayRecord {
                ForEach(record.tasks) { task in
                    Toggle(
                        isOn: Binding(
                            get: {
                                store.record(for: todayKey)?.tasks.first(where: { $0.id == task.id })?.isCompleted ?? false
                            },
                            set: { newValue in
                                store.setTaskCompleted(dateKey: todayKey, taskId: task.id, isCompleted: newValue)
                            }
                        )
                    ) {
                        Text(task.title)
                            .font(.subheadline)
                    }
                    .toggleStyle(.switch)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Enerji Durumu")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    HStack(spacing: 8) {
                        ForEach(1...5, id: \.self) { value in
                            Button {
                                store.updateMood(dateKey: todayKey, mood: value)
                            } label: {
                                Text(value <= (store.record(for: todayKey)?.mood ?? 3) ? "★" : "☆")
                                    .font(.title3)
                                    .foregroundColor(.yellow)
                            }
                        }
                    }
                }
                .padding(.top, 6)

                VStack(alignment: .leading, spacing: 8) {
                    Text(record.reflectionPrompt)
                        .font(.subheadline)
                        .foregroundColor(.gray)

                    TextEditor(text: $reflectionText)
                        .frame(minHeight: 90)
                        .padding(8)
                        .background(Color.white.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .onChange(of: reflectionText) { _, newValue in
                            store.updateReflection(dateKey: todayKey, note: newValue)
                        }
                }
            } else {
                Text("Plan olusturuldugunda burada goreceksin.")
                    .foregroundColor(.gray)
                    .font(.subheadline)
            }
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 18).fill(.ultraThinMaterial))
    }

    private var progressCard: some View {
        let scores = store.last7DayScores()

        return VStack(alignment: .leading, spacing: 12) {
            Text("7 Gunluk Kozmik Uyum Trendi")
                .font(.headline)

            HStack(alignment: .bottom, spacing: 10) {
                ForEach(Array(scores.enumerated()), id: \.offset) { pair in
                    let entry = pair.element
                    VStack(spacing: 6) {
                        RoundedRectangle(cornerRadius: 5)
                            .fill(
                                LinearGradient(
                                    colors: [.purple.opacity(0.7), .pink.opacity(0.9)],
                                    startPoint: .bottom,
                                    endPoint: .top
                                )
                            )
                            .frame(width: 26, height: max(CGFloat(entry.score), 4))

                        Text(entry.day)
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.top, 6)

            Text("Skor; tamamlanan aksiyonlar ve gunluk enerji durumundan hesaplanir.")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 18).fill(.ultraThinMaterial))
    }

    private func hydrateFromToday() {
        guard let record = todayRecord else {
            reflectionText = ""
            return
        }
        goal = record.goal
        selectedFocus = record.focusArea
        reflectionText = record.reflectionNote
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthManager())
        .environmentObject(SubscriptionManager())
}
