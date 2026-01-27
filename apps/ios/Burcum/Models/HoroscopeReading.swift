import Foundation

struct HoroscopeReading: Codable, Identifiable {
    let id: String
    let zodiacSign: String
    let readingType: ReadingType
    let content: String
    let advice: String?
    let loveScore: Int?
    let careerScore: Int?
    let healthScore: Int?
    let luckyNumbers: [Int]?
    let luckyColor: String?
    let createdAt: String
}

enum ReadingType: String, Codable {
    case daily
    case weekly
    case monthly
    case yearly
}

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: String?
    let cached: Bool?
}

struct CompatibilityResult: Codable {
    let sign1: String
    let sign2: String
    let overallScore: Int
    let loveScore: Int
    let friendshipScore: Int
    let workScore: Int
    let analysis: String
    let strengths: [String]
    let challenges: [String]
    let advice: String
}
