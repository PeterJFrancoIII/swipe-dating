import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        TabView(selection: $model.tab) {
            NavigationStack {
                SwipeDeckView()
            }
            .tabItem { Label("Discover", systemImage: "rectangle.stack") }
            .tag(AppModel.MainTab.discover)

            NavigationStack {
                MatchesListView()
            }
            .tabItem { Label("Matches", systemImage: "heart") }
            .tag(AppModel.MainTab.matches)

            NavigationStack {
                SkinShopView()
            }
            .tabItem { Label("Shop", systemImage: "paintpalette") }
            .tag(AppModel.MainTab.shop)

            NavigationStack {
                SafetyCenterView()
            }
            .tabItem { Label("Safety", systemImage: "shield") }
            .tag(AppModel.MainTab.safety)

            NavigationStack {
                SettingsView()
            }
            .tabItem { Label("Settings", systemImage: "gearshape") }
            .tag(AppModel.MainTab.settings)
        }
    }
}

struct SwipeDeckView: View {
    @EnvironmentObject private var model: AppModel
    @State private var showDetails = false
    @State private var showReport = false

    var body: some View {
        VStack(spacing: 12) {
            StagingBannerView()
            GetFkdControlView()
            availabilityRow

            if model.emergencyPrivacyMode || !model.availabilityOnline {
                ContentUnavailableView(
                    "Offline for discovery",
                    systemImage: "eye.slash",
                    description: Text(model.emergencyPrivacyMode
                        ? "Emergency privacy mode stopped discovery and proximity."
                        : "Turn availability on to browse.")
                )
            } else if let profile = model.visibleCandidates.first {
                ProfileCardView(profile: profile)
                    .padding(.horizontal)
                accessibilityActions(for: profile)
            } else {
                ContentUnavailableView(
                    "No one nearby right now",
                    systemImage: "person.2.slash",
                    description: Text(model.deckSource.contains("live")
                        ? "No other live tickets in region (self filtered). Tap Sync or wait for peers."
                        : "Strict zero-store mode needs peers online. Staging deck exhausted.")
                )
            }
            Spacer(minLength: 0)
        }
        .padding(.top, 8)
        .navigationTitle("Discover")
        .sheet(isPresented: $showDetails) {
            if let profile = model.visibleCandidates.first {
                NavigationStack {
                    ProfileDetailView(profile: profile)
                }
            }
        }
        .sheet(isPresented: $showReport) {
            if let profile = model.visibleCandidates.first {
                NavigationStack {
                    ReportFlowView(profile: profile)
                }
            }
        }
        .sheet(item: $model.pendingLocationSharePrompt) { profile in
            NavigationStack {
                MatchLocationConsentSheet(profile: profile)
            }
        }
    }

    private var availabilityRow: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Toggle("Available", isOn: Binding(
                    get: { model.availabilityOnline },
                    set: { online in
                        model.availabilityOnline = online
                        if online && !model.emergencyPrivacyMode {
                            model.startPresenceRefreshLoop()
                            Task { await model.publishPresenceAndRefreshDiscovery() }
                        } else {
                            model.stopPresenceRefreshLoop()
                        }
                    }
                ))
                .disabled(model.emergencyPrivacyMode)

                Text(model.coarseRegionLabel)
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Button(model.isSyncingPresence ? "…" : "Sync") {
                    Task { await model.publishPresenceAndRefreshDiscovery() }
                }
                .font(.caption)
                .disabled(!model.availabilityOnline || model.emergencyPrivacyMode || model.isSyncingPresence)
            }

            Text("Deck: \(model.deckSource) · locally ranked when questionnaire answers overlap")
                .font(.caption2)
                .foregroundStyle(.secondary)

            if !model.controlPlaneNote.isEmpty {
                Text(model.controlPlaneNote)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            if model.liveTicketCount > 0 {
                Text("Tickets in region: \(model.liveTicketCount) (self filtered from deck)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal)
    }

    @ViewBuilder
    private func accessibilityActions(for profile: SyntheticProfile) -> some View {
        // Swiping must not be the only way to act.
        VStack(spacing: 10) {
            HStack(spacing: 12) {
                Button("Pass") { model.passCurrent() }
                    .buttonStyle(.bordered)
                    .accessibilityLabel("Pass on \(profile.displayName)")
                Button("Interested") { model.likeCurrent() }
                    .buttonStyle(.borderedProminent)
                    .accessibilityLabel("Interested in \(profile.displayName)")
            }
            HStack(spacing: 12) {
                Button("Details") { showDetails = true }
                    .accessibilityLabel("Details for \(profile.displayName)")
                Button("Block", role: .destructive) { model.block(profileId: profile.id) }
                    .accessibilityLabel("Block \(profile.displayName)")
                Button("Report", role: .destructive) { showReport = true }
                    .accessibilityLabel("Report \(profile.displayName)")
            }
            .font(.subheadline)
        }
        .padding()
    }
}

struct ProfileCardView: View {
    @EnvironmentObject private var model: AppModel
    let profile: SyntheticProfile

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: cardColors,
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 300)
                .overlay(alignment: .topLeading) {
                    Text(profile.source == .liveTicket ? "LIVE TICKET" : "SYNTHETIC")
                        .font(.caption2.weight(.semibold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(.ultraThinMaterial, in: Capsule())
                        .padding(12)
                }
                .overlay(alignment: .topTrailing) {
                    if let score = model.compatibilityScore(for: profile) {
                        Text("\(score)% aligned")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.ultraThinMaterial, in: Capsule())
                            .padding(12)
                    }
                }
                .overlay(alignment: .bottomLeading) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(profile.displayName)
                            .font(.title.bold())
                        Text("\(profile.ageBand) · \(profile.distanceBand)")
                            .font(.subheadline)
                        if let selectedSkinId = model.selectedSkinId {
                            Text("Skin: \(selectedSkinId)")
                                .font(.caption2)
                        }
                    }
                    .padding()
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel(cardAccessibilityLabel)

            Text(profile.about)
                .font(.body)

            if profile.source == .liveTicket, !profile.ticketIdShort.isEmpty {
                Text("Ticket \(profile.ticketIdShort)… · capsule not fetched · reciprocal interest required")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var cardColors: [Color] {
        if model.selectedSkinId == "skin-neon-night" {
            return [Color.purple.opacity(0.5), Color.cyan.opacity(0.35)]
        }
        if model.selectedSkinId == "skin-minimal-dark" {
            return [Color.gray.opacity(0.55), Color.black.opacity(0.45)]
        }
        return profile.source == .liveTicket
            ? [Color.teal.opacity(0.35), Color.blue.opacity(0.25)]
            : [Color.orange.opacity(0.35), Color.pink.opacity(0.25)]
    }

    private var cardAccessibilityLabel: String {
        let score = model.compatibilityScore(for: profile).map { ", \($0) percent aligned" } ?? ""
        return "\(profile.displayName), \(profile.ageBand), \(profile.distanceBand)\(score)"
    }
}

struct ProfileDetailView: View {
    @EnvironmentObject private var model: AppModel
    let profile: SyntheticProfile
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        List {
            Section("Profile") {
                Text(profile.displayName)
                Text(profile.ageBand)
                Text(profile.distanceBand)
                Text(profile.about)
                LabeledContent("Source", value: profile.source == .liveTicket ? "Live ticket" : "Synthetic")
                if let score = model.compatibilityScore(for: profile) {
                    LabeledContent("Local alignment", value: "\(score)%")
                }
            }

            Section("Privacy") {
                Text("Exact location is never shown during discovery. Pre-match transport is relay-first. Live tickets do not include bio/photos until a consented capsule fetch is wired.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Consent") {
                Text(profile.source == .liveTicket
                     ? "Interested records a one-sided signal only. A conversation opens only after authenticated reciprocal interest."
                     : "Synthetic staging profiles may auto-match only to exercise the local UI.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Details")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Close") { dismiss() }
            }
        }
    }
}
