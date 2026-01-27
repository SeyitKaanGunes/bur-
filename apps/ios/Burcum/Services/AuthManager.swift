import Foundation
import SwiftUI

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let zodiacSign: String?
    let birthDate: String?
    let subscriptionTier: SubscriptionTier
    let emailVerified: Bool
}

enum SubscriptionTier: String, Codable {
    case free
    case premium
    case vip
}

@MainActor
class AuthManager: ObservableObject {
    @Published var user: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var error: String?

    private let apiClient = APIClient.shared
    private let keychain = KeychainManager.shared

    init() {
        // Keychain'den kullanıcı yükle
        if let savedUser = keychain.getUser() {
            self.user = savedUser
            self.isAuthenticated = true
        }
    }

    var isPremium: Bool {
        user?.subscriptionTier == .premium || user?.subscriptionTier == .vip
    }

    var isVIP: Bool {
        user?.subscriptionTier == .vip
    }

    func login(email: String, password: String) async {
        isLoading = true
        error = nil

        do {
            let response = try await performLogin(email: email, password: password)
            self.user = response.user
            self.isAuthenticated = true
            _ = keychain.saveToken(response.token)
            _ = keychain.saveUser(response.user)
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func register(email: String, password: String, name: String?, birthDate: Date?) async {
        isLoading = true
        error = nil

        do {
            let response = try await performRegister(
                email: email,
                password: password,
                name: name,
                birthDate: birthDate
            )
            self.user = response.user
            self.isAuthenticated = true
            _ = keychain.saveToken(response.token)
            _ = keychain.saveUser(response.user)
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func logout() {
        user = nil
        isAuthenticated = false
        keychain.clearAll()
    }

    func refreshUser() async {
        do {
            let response: APIResponse<User> = try await fetchCurrentUser()
            if let updatedUser = response.data {
                self.user = updatedUser
                _ = keychain.saveUser(updatedUser)
            }
        } catch {
            // Silent fail - kullanıcı hala cached data ile devam eder
        }
    }

    // MARK: - Private API Calls

    private struct AuthResponse: Codable {
        let user: User
        let token: String
    }

    private func performLogin(email: String, password: String) async throws -> AuthResponse {
        // API call implementation
        // Bu gerçek implementasyonda APIClient üzerinden yapılacak
        throw APIError.serverError(500) // Placeholder
    }

    private func performRegister(email: String, password: String, name: String?, birthDate: Date?) async throws -> AuthResponse {
        throw APIError.serverError(500) // Placeholder
    }

    private func fetchCurrentUser<T: Codable>() async throws -> T {
        throw APIError.serverError(500) // Placeholder
    }
}
