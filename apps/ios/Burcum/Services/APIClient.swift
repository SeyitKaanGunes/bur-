import Foundation

class APIClient {
    static let shared = APIClient()

    private let baseURL = "https://burcum.site/api"
    private let session: URLSession

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        session = URLSession(configuration: config)
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

    // MARK: - Private Methods

    private func get<T: Codable>(_ endpoint: String) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        // Token varsa ekle
        if let token = KeychainManager.shared.getToken() {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if httpResponse.statusCode == 401 {
                throw APIError.unauthorized
            } else if httpResponse.statusCode == 403 {
                throw APIError.premiumRequired
            }
            throw APIError.serverError(httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        return try decoder.decode(T.self, from: data)
    }

    private func post<T: Codable, B: Encodable>(_ endpoint: String, body: B) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = KeychainManager.shared.getToken() {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let encoder = JSONEncoder()
        request.httpBody = try encoder.encode(body)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError(httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        return try decoder.decode(T.self, from: data)
    }
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case noData
    case unauthorized
    case premiumRequired
    case serverError(Int)
    case decodingError

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Geçersiz URL"
        case .invalidResponse:
            return "Geçersiz yanıt"
        case .noData:
            return "Veri bulunamadı"
        case .unauthorized:
            return "Giriş yapmanız gerekiyor"
        case .premiumRequired:
            return "Bu özellik Premium üyelere özeldir"
        case .serverError(let code):
            return "Sunucu hatası: \(code)"
        case .decodingError:
            return "Veri işleme hatası"
        }
    }
}
