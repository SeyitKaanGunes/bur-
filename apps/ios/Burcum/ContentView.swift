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

            CompatibilityView()
                .tabItem {
                    Image(systemName: "heart.fill")
                    Text("Uyumluluk")
                }
                .tag(1)

            if authManager.isAuthenticated {
                ProfileView()
                    .tabItem {
                        Image(systemName: "person.fill")
                        Text("Profil")
                    }
                    .tag(2)
            } else {
                AuthView()
                    .tabItem {
                        Image(systemName: "person.fill")
                        Text("Giriş")
                    }
                    .tag(2)
            }
        }
        .tint(.purple)
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthManager())
        .environmentObject(SubscriptionManager())
}
