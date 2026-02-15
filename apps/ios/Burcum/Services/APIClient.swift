import Foundation
import Network

// MARK: - Request/Response DTOs

struct LoginRequest: Encodable {
    let email: String
    let password: String
}

struct RegisterRequest: Encodable {
    let email: String
    let password: String
    let name: String
    let birthDate: String
    let birthTime: String?
    let birthCity: String?
}

struct LogoutResponse: Codable {
    let message: String?
}

struct APIErrorResponse: Codable {
    let success: Bool?
    let error: String?
}

// MARK: - Network Monitor

final class NetworkMonitor {
    static let shared = NetworkMonitor()
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "com.burcum.networkmonitor")

    private(set) var isConnected = true
    private(set) var connectionType: NWInterface.InterfaceType?

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            self?.isConnected = path.status == .satisfied
            self?.connectionType = path.availableInterfaces.first?.type
        }
        monitor.start(queue: queue)
    }
}

// MARK: - API Client

class APIClient {
    static let shared = APIClient()

    private let baseURL = "https://burcum.site/api"
    private let session: URLSession
    private let networkMonitor = NetworkMonitor.shared

    // Retry configuration
    private let maxRetries = 2
    private let retryableStatusCodes: Set<Int> = [500, 502, 503, 504]
    private let initialRetryDelay: TimeInterval = 1.0

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        config.httpCookieAcceptPolicy = .always
        config.httpShouldSetCookies = true
        config.waitsForConnectivity = true
        config.timeoutIntervalForResource = 120
        session = URLSession(configuration: config)
    }

    // MARK: - Auth Endpoints

    func login(email: String, password: String) async throws -> APIResponse<User> {
        let body = LoginRequest(email: email, password: password)
        return try await post("/auth/login", body: body, retryCount: 0) // Auth: no retry
    }

    func register(request: RegisterRequest) async throws -> APIResponse<User> {
        return try await post("/auth/register", body: request, retryCount: 0) // Auth: no retry
    }

    func getCurrentUser() async throws -> APIResponse<User> {
        return try await get("/auth/me")
    }

    func logout() async throws -> APIResponse<LogoutResponse> {
        let body: [String: String] = [:]
        return try await post("/auth/logout", body: body, retryCount: 0)
    }

    func deleteAccount() async throws -> APIResponse<LogoutResponse> {
        let body: [String: String] = [:]
        return try await post("/auth/delete-account", body: body, retryCount: 0)
    }

    // MARK: - Horoscope Endpoints

    func getDailyHoroscope(sign: ZodiacSign) async throws -> HoroscopeReading {
        let response: APIResponse<HoroscopeReading> = try await get("/horoscope/daily/\(sign.rawValue)")
        guard let data = response.data else {
            throw APIError.noData
        }
        return data
    }

    func getWeeklyHoroscope(sign: ZodiacSign) async throws -> HoroscopeReading {
        let response: APIResponse<HoroscopeReading> = try await get("/horoscope/weekly/\(sign.rawValue)")
        guard let data = response.data else {
            throw APIError.noData
        }
        return data
    }

    func getMonthlyHoroscope(sign: ZodiacSign) async throws -> HoroscopeReading {
        let response: APIResponse<HoroscopeReading> = try await get("/horoscope/monthly/\(sign.rawValue)")
        guard let data = response.data else {
            throw APIError.noData
        }
        return data
    }

    func getYearlyHoroscope(sign: ZodiacSign) async throws -> HoroscopeReading {
        let response: APIResponse<HoroscopeReading> = try await get("/horoscope/yearly/\(sign.rawValue)")
        guard let data = response.data else {
            throw APIError.noData
        }
        return data
    }

    // MARK: - Compatibility

    func getCompatibility(sign1: ZodiacSign, sign2: ZodiacSign) async throws -> CompatibilityResult {
        let body = ["sign1": sign1.rawValue, "sign2": sign2.rawValue]
        let response: APIResponse<CompatibilityResult> = try await post("/compatibility", body: body)
        guard let data = response.data else {
            throw APIError.noData
        }
        return data
    }

    // MARK: - Cookie Management

    func clearCookies() {
        let storage = HTTPCookieStorage.shared
        if let url = URL(string: baseURL) {
            storage.cookies(for: url)?.forEach { storage.deleteCookie($0) }
        }
        // Also clear by domain to catch all variations (.burcum.site etc.)
        storage.cookies?.filter { $0.domain.contains("burcum.site") }.forEach { storage.deleteCookie($0) }
    }

    // MARK: - Private Methods

    private func get<T: Codable>(_ endpoint: String) async throws -> T {
        // Check network before attempting
        guard networkMonitor.isConnected else {
            throw APIError.noInternet
        }

        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        return try await performRequestWithRetry(request: request, retryCount: maxRetries)
    }

    private func post<T: Codable, B: Encodable>(_ endpoint: String, body: B, retryCount: Int? = nil) async throws -> T {
        // Check network before attempting
        guard networkMonitor.isConnected else {
            throw APIError.noInternet
        }

        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let encoder = JSONEncoder()
            request.httpBody = try encoder.encode(body)
        } catch {
            throw APIError.encodingError
        }

        return try await performRequestWithRetry(request: request, retryCount: retryCount ?? maxRetries)
    }

    private func performRequestWithRetry<T: Codable>(request: URLRequest, retryCount: Int) async throws -> T {
        var lastError: Error?

        for attempt in 0...retryCount {
            do {
                let (data, response) = try await session.data(for: request)
                return try handleResponse(data: data, response: response)
            } catch let error as APIError {
                // Don't retry auth errors, client errors, or premium errors
                switch error {
                case .unauthorized, .premiumRequired, .rateLimited, .invalidURL, .invalidResponse, .encodingError:
                    throw error
                case .serverError(let code) where retryableStatusCodes.contains(code):
                    lastError = error
                case .serverErrorWithMessage(let code, _) where retryableStatusCodes.contains(code):
                    lastError = error
                default:
                    if attempt < retryCount {
                        lastError = error
                    } else {
                        throw error
                    }
                }
            } catch let error as URLError {
                lastError = error
                // Don't retry cancelled requests
                if error.code == .cancelled {
                    throw APIError.requestCancelled
                }
                // Map specific URL errors
                if error.code == .notConnectedToInternet || error.code == .networkConnectionLost {
                    throw APIError.noInternet
                }
                if error.code == .timedOut {
                    if attempt >= retryCount {
                        throw APIError.timeout
                    }
                    lastError = APIError.timeout
                }
            } catch {
                lastError = error
                if attempt >= retryCount {
                    throw APIError.unknown(error)
                }
            }

            // Wait before retrying with exponential backoff
            if attempt < retryCount {
                let delay = initialRetryDelay * pow(2.0, Double(attempt))
                try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            }
        }

        throw lastError ?? APIError.unknown(nil)
    }

    private func handleResponse<T: Codable>(data: Data, response: URLResponse) throws -> T {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if httpResponse.statusCode == 401 {
                NotificationCenter.default.post(name: .authSessionExpired, object: nil)
                throw APIError.unauthorized
            } else if httpResponse.statusCode == 403 {
                throw APIError.premiumRequired
            } else if httpResponse.statusCode == 429 {
                throw APIError.rateLimited
            }

            if let errorResponse = try? JSONDecoder().decode(APIErrorResponse.self, from: data),
               let errorMessage = errorResponse.error {
                throw APIError.serverErrorWithMessage(httpResponse.statusCode, errorMessage)
            }
            throw APIError.serverError(httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        do {
            return try decoder.decode(T.self, from: data)
        } catch let decodingError as DecodingError {
            #if DEBUG
            print("Decoding error: \(decodingError)")
            if let jsonString = String(data: data, encoding: .utf8) {
                print("Response data: \(jsonString.prefix(500))")
            }
            #endif
            throw APIError.decodingError
        }
    }
}

// MARK: - API Errors

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case noData
    case unauthorized
    case premiumRequired
    case rateLimited
    case serverError(Int)
    case serverErrorWithMessage(Int, String)
    case decodingError
    case encodingError
    case networkError(Error)
    case noInternet
    case timeout
    case requestCancelled
    case unknown(Error?)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Gecersiz URL"
        case .invalidResponse:
            return "Gecersiz yanit"
        case .noData:
            return "Veri bulunamadi"
        case .unauthorized:
            return "Giris yapmaniz gerekiyor"
        case .premiumRequired:
            return "Bu ozellik Premium uyelere ozeldir"
        case .rateLimited:
            return "Cok fazla istek gonderdiniz. Lutfen biraz bekleyin."
        case .serverError(let code):
            return "Sunucu hatasi (\(code)). Lutfen daha sonra tekrar deneyin."
        case .serverErrorWithMessage(_, let message):
            return message
        case .decodingError:
            return "Veri isleme hatasi. Lutfen uygulamayi guncelleyin."
        case .encodingError:
            return "Istek hazirlama hatasi"
        case .networkError:
            return "Baglanti hatasi. Lutfen internet baglantinizi kontrol edin."
        case .noInternet:
            return "Internet baglantisi bulunamadi. Lutfen baglantinizi kontrol edin."
        case .timeout:
            return "Sunucu yanitlamadi. Lutfen daha sonra tekrar deneyin."
        case .requestCancelled:
            return "Istek iptal edildi"
        case .unknown:
            return "Beklenmeyen bir hata olustu. Lutfen tekrar deneyin."
        }
    }

    /// User-friendly helper to check if user can retry
    var isRetryable: Bool {
        switch self {
        case .serverError, .serverErrorWithMessage, .timeout, .networkError, .noInternet, .unknown, .noData:
            return true
        case .unauthorized, .premiumRequired, .rateLimited, .invalidURL, .invalidResponse, .decodingError, .encodingError, .requestCancelled:
            return false
        }
    }
}
