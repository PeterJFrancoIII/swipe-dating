import Foundation
import SwiftUI
import Combine

/// Unidirectional app state for the staging iPhone client.
@MainActor
final class AppModel: ObservableObject {
    enum OnboardingStep: Equatable {
        case welcome
        case ageGate
        case identity
        case permissions
        case profile
        case ready
    }

    enum MainTab: Hashable {
        case discover
        case matches
        case shop
        case safety
        case settings
    }

    @Published var onboarding: OnboardingStep = .welcome
    @Published var tab: MainTab = .discover
    @Published var eligibility: DatingCoreBridge.EligibilitySummary?
    @Published var displayName: String = ""
    @Published var aboutText: String = ""
    @Published var availabilityOnline: Bool = false
    @Published var emergencyPrivacyMode: Bool = false
    @Published var relayOnly: Bool = true
    @Published var sealedMailboxOptIn: Bool = false

    // Adult identity and private discovery preferences. These never change
    // disclosure defaults: every gender starts at prompt-before-sharing.
    @Published var genderIdentity: GenderIdentity = .preferNotToSay
    @Published var sexualOrientation: SexualOrientation = .preferNotToSay
    @Published var showMeGenders: Set<GenderIdentity> = [.woman, .man, .nonbinary]
    @Published var lookingForModes: Set<LookingForMode> = [.dating, .longTerm]
    @Published var discoveryPreferences = DiscoveryPreferences()
    @Published var questionnaireResponses: [String: QuestionnaireResponse] = [:]

    // “Get fk'd” is an adult-only, consent-based proximity mode. This staging
    // branch provides product state and haptic simulation; BLE transport remains
    // release-gated until attestation, replay defense, and red-team tests pass.
    @Published var proximityPreferences = ProximityPreferences.adultDefault
    @Published var nearbyEncounterCount = 0
    @Published var proximityStatus = "Off"

    // Match-location grants are explicit, recipient-scoped, and expiring.
    @Published var matchLocationShares: [String: MatchLocationShare] = [:]
    @Published var pendingLocationSharePrompt: DiscoverProfile?

    // Marketplace staging state. No real purchase or creator payout occurs here.
    @Published var skinEntitlements: Set<String> = ["chat-soft-glow"]
    @Published var selectedSkinId: String?
    @Published var commerceNote = "STAGING catalog — StoreKit billing and creator payouts are not connected."

    // Device/app integrity foundation. Real-user networking remains blocked until
    // passkey, adult credential, and platform attestation are verified server-side.
    @Published var botProtection = BotProtectionState.staging

    /// Live tickets preferred; synthetic seed used only as offline fallback.
    @Published var candidates: [DiscoverProfile] = DiscoverProfile.syntheticSeedDeck()
    @Published var matches: [DiscoverProfile] = []
    @Published var conversations: [String: [ChatMessage]] = [:]
    @Published var blockedIds: Set<String> = []
    @Published var passedIds: Set<String> = []
    @Published var lastError: String?
    @Published var identityCreated: Bool = false
    @Published var recoveryKitAcknowledged: Bool = false
    @Published var coarseRegionLabel: String = "nearby"
    @Published var profileIdHex: String = ""
    @Published var rootPublicKeyHex: String = ""
    @Published var liveTicketCount: Int = 0
    @Published var lastDiscoveryRegion: String = ""
    @Published var controlPlaneNote: String = ""
    @Published var deckSource: String = "synthetic fallback"
    @Published var isSyncingPresence: Bool = false

    private let matchEngine = DatingCoreBridge.LocalMatchEngine()
    #if DATING_UNIFFI_LINKED
    private var identityHandle: IdentityHandle?
    #endif
    private let controlPlane = ControlPlaneClient()
    private var ownRendezvousIdHex: String = ""
    private var presenceRefreshTask: Task<Void, Never>?

    var protocolVersion: UInt16 { DatingCoreBridge.protocolVersion() }
    var usingStagingFallback: Bool { DatingCoreBridge.isStagingFallback }

    /// A location opt-out is a real opt-out. It no longer silently substitutes a
    /// geographic region.
    var discoveryRegion: String? {
        if coarseRegionLabel == "region hidden" || coarseRegionLabel.isEmpty {
            return nil
        }
        if coarseRegionLabel == "nearby" {
            return "us-west-coarse"
        }
        return coarseRegionLabel
    }

    var visibleCandidates: [DiscoverProfile] {
        candidates
            .filter { profile in
                !blockedIds.contains(profile.id)
                    && !passedIds.contains(profile.id)
                    && !matches.contains(where: { $0.id == profile.id })
                    && (ownRendezvousIdHex.isEmpty || profile.id != ownRendezvousIdHex)
            }
            .sorted { lhs, rhs in
                let left = compatibilityScore(for: lhs) ?? -1
                let right = compatibilityScore(for: rhs) ?? -1
                if left == right { return lhs.displayName < rhs.displayName }
                return left > right
            }
    }

    func compatibilityScore(for profile: DiscoverProfile) -> Int? {
        guard let candidateAnswers = AlignmentQuestionnaire.syntheticCandidateAnswers[profile.id] else {
            return nil
        }
        return AlignmentQuestionnaire.score(
            userResponses: questionnaireResponses,
            candidateAnswers: candidateAnswers
        )
    }

    func completeWelcome() {
        onboarding = .ageGate
    }

    /// Exact-date adult check. A birth-year-only calculation could admit someone
    /// who is still 17 and turns 18 later in the year.
    func submitAgeGate(birthDate: Date) {
        lastError = nil
        let calendar = Calendar(identifier: .gregorian)
        let today = Date()
        guard birthDate <= today else {
            lastError = "Enter a valid date of birth."
            return
        }
        guard let age = calendar.dateComponents([.year], from: birthDate, to: today).year,
              age >= 18 else {
            lastError = "Must be 18+ to continue."
            return
        }

        do {
            let summary = try DatingCoreBridge.evaluateMockAgeEligibility(
                adult: true,
                ambiguous: false,
                unavailable: false
            )
            let now = Int64(Date().timeIntervalSince1970)
            try DatingCoreBridge.assertDiscoveryAllowed(summary, nowUnix: now)
            eligibility = summary
            onboarding = .identity
        } catch {
            lastError = "Age eligibility failed closed: \(error.localizedDescription)"
        }
    }

    func createLocalIdentity(acknowledgeRecovery: Bool) {
        guard acknowledgeRecovery else {
            lastError = "Confirm you understand recovery is user-controlled before continuing."
            return
        }
        #if DATING_UNIFFI_LINKED
        let handle = DatingCoreBridge.retainIdentityHandle()
        identityHandle = handle
        let summary = handle.publicIdentitySummary()
        profileIdHex = summary.profileIdHex
        rootPublicKeyHex = summary.rootPublicKeyHex
        #else
        if let generated = DatingCoreBridge.generateLocalIdentity() {
            profileIdHex = generated.profileIdHex
            rootPublicKeyHex = generated.rootPublicKeyHex
        } else {
            profileIdHex = "staging-mock-profile"
            rootPublicKeyHex = "staging-mock-pubkey"
        }
        #endif
        identityCreated = true
        recoveryKitAcknowledged = true
        lastError = nil
        onboarding = .permissions
    }

    func finishPermissions(enableCoarseRegion: Bool) {
        if enableCoarseRegion {
            // Synthetic coordinate is used only to exercise the staging core. A
            // real permission-controlled location adapter remains release-gated.
            coarseRegionLabel = DatingCoreBridge.coarseRegionBandLabel(
                lat: 40.71,
                lon: -74.00,
                jitterSeed: 7
            )
        } else {
            coarseRegionLabel = "region hidden"
        }
        onboarding = .profile
    }

    func saveProfile() {
        let name = displayName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard (2 ... 32).contains(name.count) else {
            lastError = "Display name must be 2–32 characters."
            return
        }
        if aboutText.count > 500 {
            lastError = "About text is too long."
            return
        }
        lastError = nil
        onboarding = .ready
        availabilityOnline = true
        startPresenceRefreshLoop()
        Task { await publishPresenceAndRefreshDiscovery() }
    }

    /// Publish signed presence and rebuild Discover from live tickets (synthetic fallback if empty).
    func publishPresenceAndRefreshDiscovery() async {
        guard let region = discoveryRegion else {
            lastDiscoveryRegion = "hidden"
            controlPlaneNote = "Location-based discovery is off. Enable a coarse region to publish presence."
            return
        }
        lastDiscoveryRegion = region
        isSyncingPresence = true
        defer { isSyncingPresence = false }

        #if DATING_UNIFFI_LINKED
        guard let handle = identityHandle else {
            controlPlaneNote = "No identity handle — create identity first."
            return
        }
        do {
            let now = Int64(Date().timeIntervalSince1970)
            let leaseJSON = try handle.buildStagingPresenceLeaseJson(
                coarseRegion: region,
                nowUnix: now,
                ttlSecs: 120
            )
            if let rid = ControlPlaneClient.rendezvousIdHex(fromLeaseJSON: leaseJSON) {
                ownRendezvousIdHex = rid
            }
            try await controlPlane.putPresence(leaseJSON: leaseJSON)
            let snap = try await controlPlane.fetchDiscovery(region: region)
            applyDiscovery(snap)
            lastError = nil
        } catch {
            controlPlaneNote = "Control plane unreachable (`make local-services-up`): \(error.localizedDescription)"
            if candidates.allSatisfy({ $0.source == .liveTicket }) {
                candidates = DiscoverProfile.syntheticSeedDeck()
                deckSource = "synthetic fallback (offline)"
            }
        }
        #else
        controlPlaneNote = "UniFFI not linked — presence publish unavailable."
        #endif
    }

    private func applyDiscovery(_ snap: ControlPlaneClient.DiscoverySnapshot) {
        liveTicketCount = snap.ticketCount
        let peers = snap.tickets
            .filter { $0.rendezvousIdHex != ownRendezvousIdHex }
            .map { DiscoverProfile.fromTicket($0, region: snap.region) }

        if peers.isEmpty {
            let existingLive = candidates.filter { $0.source == .liveTicket }
            if existingLive.isEmpty {
                candidates = DiscoverProfile.syntheticSeedDeck()
                deckSource = "synthetic fallback"
                controlPlaneNote = "Presence ok · 0 other peers in \(snap.region) (showing synthetic deck)"
            } else {
                deckSource = "live tickets (stale keep)"
                controlPlaneNote = "Presence ok · 0 new peers · kept \(existingLive.count) prior"
            }
        } else {
            var byId: [String: DiscoverProfile] = [:]
            for profile in peers { byId[profile.id] = profile }
            candidates = Array(byId.values).sorted { $0.displayName < $1.displayName }
            deckSource = "live tickets"
            controlPlaneNote = "Presence published · \(peers.count) peer(s) in \(snap.region)"
        }
    }

    func startPresenceRefreshLoop() {
        presenceRefreshTask?.cancel()
        presenceRefreshTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 45_000_000_000)
                guard let self, !Task.isCancelled else { return }
                guard self.availabilityOnline, !self.emergencyPrivacyMode else { continue }
                await self.publishPresenceAndRefreshDiscovery()
            }
        }
    }

    func stopPresenceRefreshLoop() {
        presenceRefreshTask?.cancel()
        presenceRefreshTask = nil
    }

    func passCurrent() {
        guard let top = visibleCandidates.first else { return }
        do {
            try matchEngine.pass(profileLabel: top.id)
            passedIds.insert(top.id)
            lastError = nil
        } catch {
            lastError = "Pass failed: \(error.localizedDescription)"
        }
    }

    func likeCurrent() {
        guard let top = visibleCandidates.first else { return }
        do {
            try matchEngine.like(profileLabel: top.id)
            if top.autoMatchOnLike {
                try matchEngine.confirmStagingMatch(profileLabel: top.id)
                matches.insert(top, at: 0)
                let body = "You’re matched in synthetic staging. State: \(matchEngine.stateLabel(profileLabel: top.id)). Messages stay on-device."
                conversations[top.id] = [
                    ChatMessage(id: UUID().uuidString, body: body, fromMe: false, sentAt: Date())
                ]
                pendingLocationSharePrompt = top
            } else if top.source == .liveTicket {
                controlPlaneNote = "Interest saved locally. A live match requires reciprocal authenticated interest."
            }
            passedIds.insert(top.id)
            lastError = nil
        } catch {
            lastError = "Like failed: \(error.localizedDescription)"
        }
    }

    func block(profileId: String) {
        do {
            try matchEngine.block(profileLabel: profileId)
            blockedIds.insert(profileId)
            matches.removeAll { $0.id == profileId }
            conversations[profileId] = nil
            matchLocationShares[profileId] = nil
            if pendingLocationSharePrompt?.id == profileId {
                pendingLocationSharePrompt = nil
            }
            lastError = nil
        } catch {
            lastError = "Block failed: \(error.localizedDescription)"
        }
    }

    func sendMessage(to profileId: String, text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        guard matches.contains(where: { $0.id == profileId }) else {
            lastError = "Messaging requires a mutual match."
            return
        }
        var thread = conversations[profileId] ?? []
        thread.append(ChatMessage(id: UUID().uuidString, body: trimmed, fromMe: true, sentAt: Date()))
        conversations[profileId] = thread
    }

    func setProximityEnabled(_ enabled: Bool) {
        guard eligibility?.adult == true else {
            proximityPreferences.enabled = false
            lastError = "Adult eligibility is required for Get fk'd."
            return
        }
        guard !emergencyPrivacyMode else {
            proximityPreferences.enabled = false
            lastError = "Turn off emergency privacy before enabling proximity."
            return
        }

        proximityPreferences.enabled = enabled
        proximityStatus = enabled
            ? "STAGING simulation on · prompt-before-sharing · no profile data in Bluetooth advertisements"
            : "Off"
    }

    func simulateNearbyEncounter() {
        guard proximityPreferences.enabled else { return }
        nearbyEncounterCount += 1
        proximityStatus = "Nearby compatible adult detected · profile disclosure still requires your policy"
    }

    func updateQuestionnaireResponse(questionId: String, response: QuestionnaireResponse) {
        questionnaireResponses[questionId] = response
    }

    func clearQuestionnaire() {
        questionnaireResponses = [:]
    }

    func shareLocation(with profile: DiscoverProfile, mode: LocationShareMode) {
        guard matches.contains(where: { $0.id == profile.id }) else {
            lastError = "Location can be shared only with a current match."
            return
        }

        let now = Date()
        // Staging-only coordinates exercise the map without collecting a user's
        // real location. Production must obtain an explicit OS permission grant.
        let seed = profile.id.unicodeScalars.reduce(0) { $0 + Int($1.value) }
        let offset = Double(abs(seed) % 100) / 10_000
        let share = MatchLocationShare(
            id: UUID().uuidString,
            profileId: profile.id,
            mode: mode,
            latitude: 40.7128 + offset,
            longitude: -74.0060 - offset,
            createdAt: now,
            expiresAt: now.addingTimeInterval(mode.duration)
        )
        matchLocationShares[profile.id] = share
        pendingLocationSharePrompt = nil
    }

    func declineLocationSharePrompt() {
        pendingLocationSharePrompt = nil
    }

    func revokeLocationShare(profileId: String) {
        matchLocationShares[profileId] = nil
    }

    func activeLocationShare(for profileId: String) -> MatchLocationShare? {
        guard let share = matchLocationShares[profileId], share.isActive else { return nil }
        return share
    }

    func previewOrPurchaseSkin(_ asset: SkinAsset) {
        // A real build must validate StoreKit/Play Billing receipts server-side.
        // Staging grants a local preview entitlement only.
        skinEntitlements.insert(asset.id)
        selectedSkinId = asset.id
        commerceNote = "STAGING preview applied: \(asset.title). No charge or creator payout occurred."
    }

    func toggleEmergencyPrivacy() {
        emergencyPrivacyMode.toggle()
        if emergencyPrivacyMode {
            availabilityOnline = false
            proximityPreferences.enabled = false
            proximityStatus = "Off — emergency privacy"
            stopPresenceRefreshLoop()
            matchLocationShares = [:]
            controlPlaneNote = "Emergency privacy: refresh stopped; the current 120-second server lease may remain until expiry."
        }
    }

    func deleteLocalAccount() {
        stopPresenceRefreshLoop()
        eligibility = nil
        displayName = ""
        aboutText = ""
        matches = []
        conversations = [:]
        blockedIds = []
        passedIds = []
        identityCreated = false
        recoveryKitAcknowledged = false
        availabilityOnline = false
        profileIdHex = ""
        rootPublicKeyHex = ""
        liveTicketCount = 0
        lastDiscoveryRegion = ""
        controlPlaneNote = ""
        deckSource = "synthetic fallback"
        ownRendezvousIdHex = ""
        genderIdentity = .preferNotToSay
        sexualOrientation = .preferNotToSay
        showMeGenders = [.woman, .man, .nonbinary]
        lookingForModes = [.dating, .longTerm]
        discoveryPreferences = DiscoveryPreferences()
        questionnaireResponses = [:]
        proximityPreferences = .adultDefault
        nearbyEncounterCount = 0
        proximityStatus = "Off"
        matchLocationShares = [:]
        pendingLocationSharePrompt = nil
        skinEntitlements = ["chat-soft-glow"]
        selectedSkinId = nil
        commerceNote = "STAGING catalog — StoreKit billing and creator payouts are not connected."
        botProtection = .staging
        #if DATING_UNIFFI_LINKED
        identityHandle = nil
        #endif
        candidates = DiscoverProfile.syntheticSeedDeck()
        onboarding = .welcome
        tab = .discover
    }
}

struct DiscoverProfile: Identifiable, Equatable, Hashable {
    enum Source: String, Hashable {
        case synthetic
        case liveTicket
    }

    let id: String
    let displayName: String
    let ageBand: String
    let about: String
    let distanceBand: String
    let autoMatchOnLike: Bool
    let source: Source
    let ticketIdShort: String

    static func fromTicket(_ ticket: ControlPlaneClient.DiscoveryTicket, region: String) -> DiscoverProfile {
        let short = String(ticket.rendezvousIdHex.prefix(8))
        return DiscoverProfile(
            id: ticket.rendezvousIdHex,
            displayName: "Peer \(short)",
            ageBand: "18+",
            about: "Live discovery ticket. Profile capsule not fetched yet (no operator-held bio/photos).",
            distanceBand: region,
            // Never convert a one-sided live like into a match.
            autoMatchOnLike: false,
            source: .liveTicket,
            ticketIdShort: String(ticket.ticketIdHex.prefix(8))
        )
    }

    static func syntheticSeedDeck() -> [DiscoverProfile] {
        [
            .init(id: "p1", displayName: "Alex", ageBand: "25–34", about: "Coffee, hiking, no drama.", distanceBand: "nearby", autoMatchOnLike: true, source: .synthetic, ticketIdShort: ""),
            .init(id: "p2", displayName: "Jordan", ageBand: "25–34", about: "Photos stripped of GPS in staging.", distanceBand: "within 10–25 km", autoMatchOnLike: false, source: .synthetic, ticketIdShort: ""),
            .init(id: "p3", displayName: "Sam", ageBand: "18–24", about: "Looking for something real.", distanceBand: "nearby", autoMatchOnLike: true, source: .synthetic, ticketIdShort: ""),
            .init(id: "p4", displayName: "Riley", ageBand: "35–44", about: "Relay-first by default.", distanceBand: "farther away", autoMatchOnLike: false, source: .synthetic, ticketIdShort: ""),
            .init(id: "p5", displayName: "Casey", ageBand: "25–34", about: "Safety tools are free.", distanceBand: "nearby", autoMatchOnLike: true, source: .synthetic, ticketIdShort: "")
        ]
    }
}

typealias SyntheticProfile = DiscoverProfile

struct ChatMessage: Identifiable, Equatable {
    let id: String
    let body: String
    let fromMe: Bool
    let sentAt: Date
}
