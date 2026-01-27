import SwiftUI

@main
struct BurcumApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var subscriptionManager = SubscriptionManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(subscriptionManager)
                .preferredColorScheme(.dark)
        }
    }
}
