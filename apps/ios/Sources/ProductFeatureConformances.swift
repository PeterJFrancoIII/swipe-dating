import Foundation

extension SkinAsset.Kind: Hashable {
    static func == (lhs: SkinAsset.Kind, rhs: SkinAsset.Kind) -> Bool {
        lhs.rawValue == rhs.rawValue
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(rawValue)
    }
}

extension BotRiskLevel: Equatable {
    static func == (lhs: BotRiskLevel, rhs: BotRiskLevel) -> Bool {
        lhs.rawValue == rhs.rawValue
    }
}
