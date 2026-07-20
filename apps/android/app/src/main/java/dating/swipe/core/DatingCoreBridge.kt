package dating.swipe.core

/**
 * Facade over audited UniFFI exports.
 * Uses generated bindings when JNI lib is present; otherwise STAGING_FALLBACK stub.
 */
object DatingCoreBridge {
    const val STAGING_FALLBACK_LABEL = "STAGING_FALLBACK"

    val isStagingFallback: Boolean
        get() = !UniffiCore.isNativeLibraryLoaded()

    fun protocolVersion(): UShort = UniffiCore.protocolVersion()

    data class EligibilitySummary(
        val adult: Boolean,
        val ageBand: String?,
        val issuedAtUnix: Long,
        val expiresAtUnix: Long,
        val provider: String,
        val appealAllowed: Boolean,
    )

    sealed class EligibilityError : Exception() {
        data object Ineligible : EligibilityError()
        data object Ambiguous : EligibilityError()
        data object Expired : EligibilityError()
        data object Revoked : EligibilityError()
        data object ProviderUnavailable : EligibilityError()
    }

    @Throws(EligibilityError::class)
    fun evaluateMockAgeEligibility(
        adult: Boolean,
        ambiguous: Boolean,
        unavailable: Boolean,
    ): EligibilitySummary = UniffiCore.evaluateMockAgeEligibility(adult, ambiguous, unavailable)

    @Throws(EligibilityError::class)
    fun assertDiscoveryAllowed(summary: EligibilitySummary, nowUnix: Long) {
        UniffiCore.assertDiscoveryAllowed(summary, nowUnix)
    }
}

/**
 * Dispatches to generated UniFFI Kotlin or STAGING_FALLBACK stubs matching UniFFI names.
 */
private object UniffiCore {
    fun isNativeLibraryLoaded(): Boolean = runCatching {
        uniffi.dating_uniffi_bindings.uniffiEnsureInitialized()
        true
    }.getOrDefault(false)

    fun protocolVersion(): UShort {
        if (isNativeLibraryLoaded()) {
            return uniffi.dating_uniffi_bindings.`protocolVersion`()
        }
        return 1u
    }

    @Throws(DatingCoreBridge.EligibilityError::class)
    fun evaluateMockAgeEligibility(
        adult: Boolean,
        ambiguous: Boolean,
        unavailable: Boolean,
    ): DatingCoreBridge.EligibilitySummary {
        if (isNativeLibraryLoaded()) {
            return try {
                val summary = uniffi.dating_uniffi_bindings.`evaluateMockAgeEligibility`(
                    adult,
                    ambiguous,
                    unavailable,
                )
                DatingCoreBridge.EligibilitySummary(
                    adult = summary.adult,
                    ageBand = summary.ageBand,
                    issuedAtUnix = summary.issuedAtUnix,
                    expiresAtUnix = summary.expiresAtUnix,
                    provider = summary.provider,
                    appealAllowed = summary.appealAllowed,
                )
            } catch (e: uniffi.dating_uniffi_bindings.EligibilityErrorCode) {
                throw mapEligibilityError(e)
            }
        }

        return UniffiStagingFallback.evaluateMockAgeEligibility(adult, ambiguous, unavailable)
    }

    @Throws(DatingCoreBridge.EligibilityError::class)
    fun assertDiscoveryAllowed(summary: DatingCoreBridge.EligibilitySummary, nowUnix: Long) {
        if (isNativeLibraryLoaded()) {
            try {
                val ffiSummary = uniffi.dating_uniffi_bindings.EligibilitySummary(
                    adult = summary.adult,
                    ageBand = summary.ageBand,
                    issuedAtUnix = summary.issuedAtUnix,
                    expiresAtUnix = summary.expiresAtUnix,
                    provider = summary.provider,
                    appealAllowed = summary.appealAllowed,
                )
                uniffi.dating_uniffi_bindings.`assertDiscoveryAllowed`(ffiSummary, nowUnix)
            } catch (e: uniffi.dating_uniffi_bindings.EligibilityErrorCode) {
                throw mapEligibilityError(e)
            }
            return
        }
        UniffiStagingFallback.assertDiscoveryAllowed(summary, nowUnix)
    }

    private fun mapEligibilityError(
        e: uniffi.dating_uniffi_bindings.EligibilityErrorCode,
    ): DatingCoreBridge.EligibilityError = when (e) {
        is uniffi.dating_uniffi_bindings.EligibilityErrorCode.Ineligible ->
            DatingCoreBridge.EligibilityError.Ineligible
        is uniffi.dating_uniffi_bindings.EligibilityErrorCode.Ambiguous ->
            DatingCoreBridge.EligibilityError.Ambiguous
        is uniffi.dating_uniffi_bindings.EligibilityErrorCode.Expired ->
            DatingCoreBridge.EligibilityError.Expired
        is uniffi.dating_uniffi_bindings.EligibilityErrorCode.Revoked ->
            DatingCoreBridge.EligibilityError.Revoked
        is uniffi.dating_uniffi_bindings.EligibilityErrorCode.ProviderUnavailable ->
            DatingCoreBridge.EligibilityError.ProviderUnavailable
    }
}

/**
 * Pure-Kotlin STAGING_FALLBACK matching UniFFI export names (no JNI).
 */
internal object UniffiStagingFallback {
    fun protocolVersion(): UShort = 1u

    @Throws(DatingCoreBridge.EligibilityError::class)
    fun evaluateMockAgeEligibility(
        adult: Boolean,
        ambiguous: Boolean,
        unavailable: Boolean,
    ): DatingCoreBridge.EligibilitySummary {
        if (unavailable) throw DatingCoreBridge.EligibilityError.ProviderUnavailable
        if (ambiguous) throw DatingCoreBridge.EligibilityError.Ambiguous
        if (!adult) throw DatingCoreBridge.EligibilityError.Ineligible
        val now = System.currentTimeMillis() / 1000
        return DatingCoreBridge.EligibilitySummary(
            adult = true,
            ageBand = "18+",
            issuedAtUnix = now,
            expiresAtUnix = now + 86_400,
            provider = "mock-${DatingCoreBridge.STAGING_FALLBACK_LABEL}",
            appealAllowed = true,
        )
    }

    @Throws(DatingCoreBridge.EligibilityError::class)
    fun assertDiscoveryAllowed(summary: DatingCoreBridge.EligibilitySummary, nowUnix: Long) {
        if (!summary.adult) throw DatingCoreBridge.EligibilityError.Ineligible
        if (nowUnix >= summary.expiresAtUnix) throw DatingCoreBridge.EligibilityError.Expired
    }
}
