import Foundation

/// Mobile facade over audited UniFFI exports.
/// When `DatingUniffiGenerated` is linked (local dev with native lib), calls pass through.
/// CI / simulator builds use the STAGING mock documented below.
public enum DatingCoreBridge {
    public static var isStagingFallback: Bool {
        #if DATING_UNIFFI_LINKED
        return false
        #else
        return true
        #endif
    }

    public static func protocolVersion() -> UInt16 {
        #if DATING_UNIFFI_LINKED
        return DatingUniffiGenerated.protocolVersion()
        #else
        return 1
        #endif
    }

    public struct EligibilitySummary: Equatable, Sendable {
        public let adult: Bool
        public let ageBand: String?
        public let issuedAtUnix: Int64
        public let expiresAtUnix: Int64
        public let provider: String
        public let appealAllowed: Bool

        public init(
            adult: Bool,
            ageBand: String?,
            issuedAtUnix: Int64,
            expiresAtUnix: Int64,
            provider: String,
            appealAllowed: Bool
        ) {
            self.adult = adult
            self.ageBand = ageBand
            self.issuedAtUnix = issuedAtUnix
            self.expiresAtUnix = expiresAtUnix
            self.provider = provider
            self.appealAllowed = appealAllowed
        }
    }

    public enum EligibilityError: Error, Equatable {
        case ineligible
        case ambiguous
        case expired
        case revoked
        case providerUnavailable
    }

    public static func evaluateMockAgeEligibility(
        adult: Bool,
        ambiguous: Bool,
        unavailable: Bool
    ) throws -> EligibilitySummary {
        #if DATING_UNIFFI_LINKED
        let summary = try DatingUniffiGenerated.evaluateMockAgeEligibility(
            adult: adult,
            ambiguous: ambiguous,
            unavailable: unavailable
        )
        return EligibilitySummary(
            adult: summary.adult,
            ageBand: summary.ageBand,
            issuedAtUnix: summary.issuedAtUnix,
            expiresAtUnix: summary.expiresAtUnix,
            provider: summary.provider,
            appealAllowed: summary.appealAllowed
        )
        #else
        if unavailable {
            throw EligibilityError.providerUnavailable
        }
        if ambiguous {
            throw EligibilityError.ambiguous
        }
        if !adult {
            throw EligibilityError.ineligible
        }
        let now = Int64(Date().timeIntervalSince1970)
        return EligibilitySummary(
            adult: true,
            ageBand: "18+",
            issuedAtUnix: now,
            expiresAtUnix: now + 86_400,
            provider: "mock-STAGING",
            appealAllowed: true
        )
        #endif
    }

    public static func assertDiscoveryAllowed(
        _ summary: EligibilitySummary,
        nowUnix: Int64
    ) throws {
        #if DATING_UNIFFI_LINKED
        let ffiSummary = DatingUniffiGenerated.EligibilitySummary(
            adult: summary.adult,
            ageBand: summary.ageBand,
            issuedAtUnix: summary.issuedAtUnix,
            expiresAtUnix: summary.expiresAtUnix,
            provider: summary.provider,
            appealAllowed: summary.appealAllowed
        )
        try DatingUniffiGenerated.assertDiscoveryAllowed(summary: ffiSummary, nowUnix: nowUnix)
        #else
        guard summary.adult else {
            throw EligibilityError.ineligible
        }
        guard nowUnix < summary.expiresAtUnix else {
            throw EligibilityError.expired
        }
        #endif
    }
}
