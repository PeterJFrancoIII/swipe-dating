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
    @Published var candidates: [SyntheticProfile] = SyntheticProfile.seedDeck()
    @Published var matches: [SyntheticProfile] = []
    @Published var conversations: [String: [ChatMessage]] = [:]
    @Published var blockedIds: Set<String> = []
    @Published var passedIds: Set<String> = []
    @Published var lastError: String?
    @Published var identityCreated: Bool = false
    @Published var recoveryKitAcknowledged: Bool = false
    @Published var coarseRegionLabel: String = "nearby"

    var protocolVersion: UInt16 { DatingCoreBridge.protocolVersion() }
    var usingStagingFallback: Bool { DatingCoreBridge.isStagingFallback }

    var visibleCandidates: [SyntheticProfile] {
        candidates.filter { profile in
            !blockedIds.contains(profile.id)
                && !passedIds.contains(profile.id)
                && !matches.contains(where: { $0.id == profile.id })
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
        identityCreated = true
        recoveryKitAcknowledged = true
        lastError = nil
        onboarding = .permissions
    }

    func finishPermissions(enableCoarseRegion: Bool) {
        if enableCoarseRegion {
            // Precise coords stay in memory only; we only keep a band label for UI.
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
    }

    func passCurrent() {
        guard let top = visibleCandidates.first else { return }
        passedIds.insert(top.id)
    }

    func likeCurrent() {
        guard let top = visibleCandidates.first else { return }
        // Staging mutual-match simulation: every other like becomes a match.
        if top.autoMatchOnLike {
            matches.insert(top, at: 0)
            conversations[top.id] = [
                ChatMessage(
                    id: UUID().uuidString,
                    body: "You’re matched. Messages stay on-device in staging.",
                    fromMe: false,
                    sentAt: Date()
                )
            ]
        }
        passedIds.insert(top.id)
    }

    func block(profileId: String) {
        blockedIds.insert(profileId)
        matches.removeAll { $0.id == profileId }
        conversations[profileId] = nil
    }

    func sendMessage(to profileId: String, text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        var thread = conversations[profileId] ?? []
        thread.append(ChatMessage(id: UUID().uuidString, body: trimmed, fromMe: true, sentAt: Date()))
        conversations[profileId] = thread
    }

    func toggleEmergencyPrivacy() {
        emergencyPrivacyMode.toggle()
        if emergencyPrivacyMode {
            availabilityOnline = false
        }
    }

    func deleteLocalAccount() {
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
        candidates = SyntheticProfile.seedDeck()
        onboarding = .welcome
        tab = .discover
    }
}

struct SyntheticProfile: Identifiable, Equatable, Hashable {
    let id: String
    let displayName: String
    let ageBand: String
    let about: String
    let distanceBand: String
    let autoMatchOnLike: Bool

    static func seedDeck() -> [SyntheticProfile] {
        [
            .init(id: "p1", displayName: "Alex", ageBand: "25–34", about: "Coffee, hiking, no drama.", distanceBand: "nearby", autoMatchOnLike: true),
            .init(id: "p2", displayName: "Jordan", ageBand: "25–34", about: "Photos stripped of GPS in staging.", distanceBand: "within 10–25 km", autoMatchOnLike: false),
            .init(id: "p3", displayName: "Sam", ageBand: "18–24", about: "Looking for something real.", distanceBand: "nearby", autoMatchOnLike: true),
            .init(id: "p4", displayName: "Riley", ageBand: "35–44", about: "Relay-first by default.", distanceBand: "farther away", autoMatchOnLike: false),
            .init(id: "p5", displayName: "Casey", ageBand: "25–34", about: "Safety tools are free.", distanceBand: "nearby", autoMatchOnLike: true),
        ]
    }
}

struct ChatMessage: Identifiable, Equatable {
    let id: String
    let body: String
    let fromMe: Bool
    let sentAt: Date
}

extension DatingCoreBridge {
    /// Staging-only helper until UniFFI location export is linked.
    static func coarseRegionBandLabel(lat: Double, lon: Double, jitterSeed: UInt64) -> String {
        #if DATING_UNIFFI_LINKED
        return coarseRegionFromLatLon(lat: lat, lon: lon, jitterSeed: jitterSeed).bandLabel
        #else
        _ = (lat, lon, jitterSeed)
        return "nearby"
        #endif
    }
}
