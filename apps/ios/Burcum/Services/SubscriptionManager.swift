import Foundation
import StoreKit

@MainActor
class SubscriptionManager: ObservableObject {
    @Published var products: [Product] = []
    @Published var purchasedProductIDs: Set<String> = []
    @Published var isLoading = false
    @Published var error: String?

    private let productIDs = [
        "com.burcum.premium.monthly",
        "com.burcum.premium.yearly",
        "com.burcum.vip.monthly",
        "com.burcum.vip.yearly"
    ]

    var premiumMonthly: Product? {
        products.first { $0.id == "com.burcum.premium.monthly" }
    }

    var premiumYearly: Product? {
        products.first { $0.id == "com.burcum.premium.yearly" }
    }

    var vipMonthly: Product? {
        products.first { $0.id == "com.burcum.vip.monthly" }
    }

    var vipYearly: Product? {
        products.first { $0.id == "com.burcum.vip.yearly" }
    }

    init() {
        Task {
            await loadProducts()
            await updatePurchasedProducts()
        }

        // Transaction listener
        Task {
            for await result in Transaction.updates {
                await handleTransaction(result)
            }
        }
    }

    func loadProducts() async {
        isLoading = true
        do {
            products = try await Product.products(for: productIDs)
            products.sort { $0.price < $1.price }
        } catch {
            self.error = "Ürünler yüklenemedi"
        }
        isLoading = false
    }

    func purchase(_ product: Product) async -> Bool {
        isLoading = true
        error = nil

        do {
            let result = try await product.purchase()

            switch result {
            case .success(let verification):
                let transaction = try checkVerified(verification)
                await transaction.finish()
                await updatePurchasedProducts()
                isLoading = false
                return true

            case .userCancelled:
                isLoading = false
                return false

            case .pending:
                error = "Satın alma onay bekliyor"
                isLoading = false
                return false

            @unknown default:
                isLoading = false
                return false
            }
        } catch {
            self.error = "Satın alma başarısız: \(error.localizedDescription)"
            isLoading = false
            return false
        }
    }

    func restorePurchases() async {
        isLoading = true
        error = nil

        do {
            try await AppStore.sync()
            await updatePurchasedProducts()
        } catch {
            self.error = "Satın almalar geri yüklenemedi"
        }

        isLoading = false
    }

    private func updatePurchasedProducts() async {
        var purchased: Set<String> = []

        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                purchased.insert(transaction.productID)
            }
        }

        purchasedProductIDs = purchased
    }

    private func handleTransaction(_ result: VerificationResult<Transaction>) async {
        guard case .verified(let transaction) = result else { return }
        await transaction.finish()
        await updatePurchasedProducts()
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw SubscriptionError.verificationFailed
        case .verified(let safe):
            return safe
        }
    }
}

enum SubscriptionError: Error, LocalizedError {
    case verificationFailed
    case purchaseFailed

    var errorDescription: String? {
        switch self {
        case .verificationFailed:
            return "Doğrulama başarısız"
        case .purchaseFailed:
            return "Satın alma başarısız"
        }
    }
}
