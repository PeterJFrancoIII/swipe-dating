import Foundation

/// Mobile facade over audited UniFFI exports.
/// Xcode app builds define `DATING_UNIFFI_LINKED` and compile `Generated/`.
/// SPM-only builds without the native lib keep the STAGING mock below.
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
        return uniffi_protocol_version()
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
        do {
            let summary = try uniffi_evaluate_mock_age_eligibility(
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
        } catch let err as EligibilityErrorCode {
            throw mapEligibility(err)
        }
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
        do {
            try uniffi_assert_discovery_allowed_bridge(
                adult: summary.adult,
                ageBand: summary.ageBand,
                issuedAtUnix: summary.issuedAtUnix,
                expiresAtUnix: summary.expiresAtUnix,
                provider: summary.provider,
                appealAllowed: summary.appealAllowed,
                nowUnix: nowUnix
            )
        } catch let err as EligibilityErrorCode {
            throw mapEligibility(err)
        }
        #else
        guard summary.adult else {
            throw EligibilityError.ineligible
        }
        guard nowUnix < summary.expiresAtUnix else {
            throw EligibilityError.expired
        }
        #endif
    }

    public static func coarseRegionBandLabel(lat: Double, lon: Double, jitterSeed: UInt64) -> String {
        #if DATING_UNIFFI_LINKED
        return uniffi_coarse_region_band_label(lat: lat, lon: lon, jitterSeed: jitterSeed)
        #else
        _ = (lat, lon, jitterSeed)
        return "nearby"
        #endif
    }

    public static func stagingProfileIdBytes(label: String) -> Data {
        #if DATING_UNIFFI_LINKED
        return uniffi_staging_profile_id_bytes(label: label)
        #else
        var bytes = Array(label.utf8)
        if bytes.count < 32 {
            bytes.append(contentsOf: repeatElement(UInt8(0), count: 32 - bytes.count))
        }
        return Data(bytes.prefix(32))
        #endif
    }

    public static func generateLocalIdentity() -> (profileIdHex: String, rootPublicKeyHex: String)? {
        #if DATING_UNIFFI_LINKED
        // Prefer retainHandle() for presence signing; this summary helper remains for SPM/mock.
        let handle = uniffi_generate_local_identity()
        let summary = handle.publicIdentitySummary()
        return (summary.profileIdHex, summary.rootPublicKeyHex)
        #else
        return nil
        #endif
    }

    #if DATING_UNIFFI_LINKED
    public static func retainIdentityHandle() -> IdentityHandle {
        uniffi_generate_local_identity()
    }
    #endif

    /// Local match/dislike engine backed by audited UniFFI store when linked.
    public final class LocalMatchEngine {
        #if DATING_UNIFFI_LINKED
        private let store: AuditedMatchStore = uniffi_make_match_store()
        #endif

        public init() {}

        public func pass(profileLabel: String) throws {
            let id = DatingCoreBridge.stagingProfileIdBytes(label: profileLabel)
            #if DATING_UNIFFI_LINKED
            try store.recordDislike(profileId: id)
            #else
            _ = id
            #endif
        }

        public func like(profileLabel: String) throws {
            let id = DatingCoreBridge.stagingProfileIdBytes(label: profileLabel)
            #if DATING_UNIFFI_LINKED
            try store.recordLike(profileId: id)
            #else
            _ = id
            #endif
        }

        public func confirmStagingMatch(profileLabel: String) throws {
            let id = DatingCoreBridge.stagingProfileIdBytes(label: profileLabel)
            #if DATING_UNIFFI_LINKED
            try store.confirmStagingMatch(profileId: id)
            #else
            _ = id
            #endif
        }

        public func block(profileLabel: String) throws {
            let id = DatingCoreBridge.stagingProfileIdBytes(label: profileLabel)
            #if DATING_UNIFFI_LINKED
            try store.blockStaging(profileId: id)
            #else
            _ = id
            #endif
        }

        public func stateLabel(profileLabel: String) -> String {
            let id = DatingCoreBridge.stagingProfileIdBytes(label: profileLabel)
            #if DATING_UNIFFI_LINKED
            return (try? store.matchStateLabel(profileId: id)) ?? "unknown"
            #else
            _ = id
            return "synthetic"
            #endif
        }
    }

    #if DATING_UNIFFI_LINKED
    private static func mapEligibility(_ err: EligibilityErrorCode) -> EligibilityError {
        switch err {
        case .Ineligible: return .ineligible
        case .Ambiguous: return .ambiguous
        case .Expired: return .expired
        case .Revoked: return .revoked
        case .ProviderUnavailable: return .providerUnavailable
        }
    }
    #endif
}
