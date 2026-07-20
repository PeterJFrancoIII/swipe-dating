import Foundation

#if DATING_UNIFFI_LINKED
/// Free-function shims: calling UniFFI free symbols from same-named static methods would recurse.
func uniffi_protocol_version() -> UInt16 {
    protocolVersion()
}

func uniffi_evaluate_mock_age_eligibility(
    adult: Bool,
    ambiguous: Bool,
    unavailable: Bool
) throws -> EligibilitySummary {
    try evaluateMockAgeEligibility(
        adult: adult,
        ambiguous: ambiguous,
        unavailable: unavailable
    )
}

func uniffi_assert_discovery_allowed(summary: EligibilitySummary, nowUnix: Int64) throws {
    try assertDiscoveryAllowed(summary: summary, nowUnix: nowUnix)
}

func uniffi_assert_discovery_allowed_bridge(
    adult: Bool,
    ageBand: String?,
    issuedAtUnix: Int64,
    expiresAtUnix: Int64,
    provider: String,
    appealAllowed: Bool,
    nowUnix: Int64
) throws {
    let summary = EligibilitySummary(
        adult: adult,
        ageBand: ageBand,
        issuedAtUnix: issuedAtUnix,
        expiresAtUnix: expiresAtUnix,
        provider: provider,
        appealAllowed: appealAllowed
    )
    try assertDiscoveryAllowed(summary: summary, nowUnix: nowUnix)
}

func uniffi_coarse_region_band_label(lat: Double, lon: Double, jitterSeed: UInt64) -> String {
    coarseRegionFromLatLon(lat: lat, lon: lon, jitterSeed: jitterSeed).bandLabel
}

func uniffi_staging_profile_id_bytes(label: String) -> Data {
    stagingProfileIdFromLabel(label: label)
}

func uniffi_generate_local_identity() -> IdentityHandle {
    generateIdentity()
}

func uniffi_make_match_store() -> AuditedMatchStore {
    AuditedMatchStore()
}
#endif
