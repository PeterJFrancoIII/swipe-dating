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

    var discoveryRegion: String {
        if coarseRegionLabel == "region hidden" || coarseRegionLabel.isEmpty || coarseRegionLabel == "nearby" {
            return "us-west-coarse"
        }
        return coarseRegionLabel
    }

    var visibleCandidates: [DiscoverProfile] {
        candidates.filter { profile in
            !blockedIds.contains(profile.id)
                && !passedIds.contains(profile.id)
                && !matches.contains(where: { $0.id == profile.id })
                && (ownRendezvousIdHex.isEmpty || profile.id != ownRendezvousIdHex)
        }
    }

    func completeWelcome() {
        onboarding = .ageGate
    }

    func submitAgeGate(birthYear: Int) {
        lastError = nil
        let yearNow = Calendar.current.component(.year, from: Date())
        let age = yearNow - birthYear
        guard (1900 ... yearNow).contains(birthYear) else {
            lastError = "Enter a valid birth year."
            return
        }
        guard age >= 18 else {
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
        let region = discoveryRegion
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
            // Keep prior live peers that are not yet passed; else synthetic dogfood deck.
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
            // Merge: new tickets first; preserve unmatched prior live not in this response briefly.
            var byId: [String: DiscoverProfile] = [:]
            for p in peers { byId[p.id] = p }
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
                let body: String
                if top.source == .liveTicket {
                    body = "Matched via live ticket \(top.ticketIdShort). Capsule fetch not wired yet — chat is on-device staging."
                } else {
                    body = "You’re matched. State: \(matchEngine.stateLabel(profileLabel: top.id)). Messages stay on-device in staging."
                }
                conversations[top.id] = [
                    ChatMessage(id: UUID().uuidString, body: body, fromMe: false, sentAt: Date())
                ]
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

    func toggleEmergencyPrivacy() {
        emergencyPrivacyMode.toggle()
        if emergencyPrivacyMode {
            availabilityOnline = false
            stopPresenceRefreshLoop()
            controlPlaneNote = "Emergency privacy — presence refresh stopped"
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
            autoMatchOnLike: true,
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
            .init(id: "p5", displayName: "Casey", ageBand: "25–34", about: "Safety tools are free.", distanceBand: "nearby", autoMatchOnLike: true, source: .synthetic, ticketIdShort: ""),
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
