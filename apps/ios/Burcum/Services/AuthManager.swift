import Foundation
import SwiftUI

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let birthDate: String
    let birthTime: String?
    let birthCity: String?
    let zodiacSign: String
    let emailVerifiedAt: String?
    let subscriptionTier: SubscriptionTier
    let dailyReadingsCount: Int?
    let lastReadingDate: String?
    let createdAt: String?

    var emailVerified: Bool {
        emailVerifiedAt != nil
    }
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
        if let savedUser = keychain.getUser() {
            self.user = savedUser
            self.isAuthenticated = true
            Task {
                await refreshUser()
            }
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
            let response = try await apiClient.login(email: email, password: password)
            guard response.success, let user = response.data else {
                self.error = response.error ?? "Giris basarisiz"
                isLoading = false
                return
            }
            self.user = user
            self.isAuthenticated = true
            _ = keychain.saveUser(user)
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Baglanti hatasi. Lutfen tekrar deneyin."
        }

        isLoading = false
    }

    func register(email: String, password: String, name: String?, birthDate: Date?) async {
        isLoading = true
        error = nil

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        let request = RegisterRequest(
            email: email,
            password: password,
            name: name ?? "",
            birthDate: birthDate.map { formatter.string(from: $0) } ?? "",
            birthTime: nil,
            birthCity: nil
        )

        do {
            let response = try await apiClient.register(request: request)
            guard response.success, let user = response.data else {
                self.error = response.error ?? "Kayit basarisiz"
                isLoading = false
                return
            }
            self.user = user
            self.isAuthenticated = true
            _ = keychain.saveUser(user)
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Baglanti hatasi. Lutfen tekrar deneyin."
        }

        isLoading = false
    }

    func logout() {
        Task {
            do {
                let _: APIResponse<LogoutResponse> = try await apiClient.logout()
            } catch {
                // Silent fail
            }
        }
        clearLocalSession()
    }

    func deleteAccount() async -> Bool {
        isLoading = true
        error = nil

        do {
            let response = try await apiClient.deleteAccount()
            guard response.success else {
                self.error = response.error ?? "Hesap silme basarisiz"
                isLoading = false
                return false
            }

            clearLocalSession()
            isLoading = false
            return true
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Hesap silinirken bir hata olustu. Lutfen tekrar deneyin."
        }

        isLoading = false
        return false
    }

    func refreshUser() async {
        do {
            let response = try await apiClient.getCurrentUser()
            if response.success, let updatedUser = response.data {
                self.user = updatedUser
                self.isAuthenticated = true
                _ = keychain.saveUser(updatedUser)
            } else if !response.success {
                clearLocalSession()
            }
        } catch let apiError as APIError {
            if case .unauthorized = apiError {
                clearLocalSession()
            }
        } catch {
            // Network error: keep cached user
        }
    }

    private func clearLocalSession() {
        apiClient.clearCookies()
        user = nil
        isAuthenticated = false
        keychain.clearAll()
    }
}
