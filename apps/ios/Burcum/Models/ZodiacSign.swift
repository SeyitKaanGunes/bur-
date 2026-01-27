import Foundation

enum ZodiacSign: String, CaseIterable, Codable, Identifiable {
    case koc = "koc"
    case boga = "boga"
    case ikizler = "ikizler"
    case yengec = "yengec"
    case aslan = "aslan"
    case basak = "basak"
    case terazi = "terazi"
    case akrep = "akrep"
    case yay = "yay"
    case oglak = "oglak"
    case kova = "kova"
    case balik = "balik"

    var id: String { rawValue }

    var turkishName: String {
        switch self {
        case .koc: return "Koç"
        case .boga: return "Boğa"
        case .ikizler: return "İkizler"
        case .yengec: return "Yengeç"
        case .aslan: return "Aslan"
        case .basak: return "Başak"
        case .terazi: return "Terazi"
        case .akrep: return "Akrep"
        case .yay: return "Yay"
        case .oglak: return "Oğlak"
        case .kova: return "Kova"
        case .balik: return "Balık"
        }
    }

    var symbol: String {
        switch self {
        case .koc: return "♈"
        case .boga: return "♉"
        case .ikizler: return "♊"
        case .yengec: return "♋"
        case .aslan: return "♌"
        case .basak: return "♍"
        case .terazi: return "♎"
        case .akrep: return "♏"
        case .yay: return "♐"
        case .oglak: return "♑"
        case .kova: return "♒"
        case .balik: return "♓"
        }
    }

    var element: Element {
        switch self {
        case .koc, .aslan, .yay: return .fire
        case .boga, .basak, .oglak: return .earth
        case .ikizler, .terazi, .kova: return .air
        case .yengec, .akrep, .balik: return .water
        }
    }

    var dateRange: String {
        switch self {
        case .koc: return "21 Mart - 19 Nisan"
        case .boga: return "20 Nisan - 20 Mayıs"
        case .ikizler: return "21 Mayıs - 20 Haziran"
        case .yengec: return "21 Haziran - 22 Temmuz"
        case .aslan: return "23 Temmuz - 22 Ağustos"
        case .basak: return "23 Ağustos - 22 Eylül"
        case .terazi: return "23 Eylül - 22 Ekim"
        case .akrep: return "23 Ekim - 21 Kasım"
        case .yay: return "22 Kasım - 21 Aralık"
        case .oglak: return "22 Aralık - 19 Ocak"
        case .kova: return "20 Ocak - 18 Şubat"
        case .balik: return "19 Şubat - 20 Mart"
        }
    }
}

enum Element: String {
    case fire, earth, air, water

    var color: String {
        switch self {
        case .fire: return "red"
        case .earth: return "green"
        case .air: return "blue"
        case .water: return "cyan"
        }
    }

    var turkishName: String {
        switch self {
        case .fire: return "Ateş"
        case .earth: return "Toprak"
        case .air: return "Hava"
        case .water: return "Su"
        }
    }
}
