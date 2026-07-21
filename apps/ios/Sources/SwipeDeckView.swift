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
            availabilityRow
            getFkdRow
            if model.emergencyPrivacyMode || !model.availabilityOnline {
                ContentUnavailableView(
                    "Offline for discovery",
                    systemImage: "eye.slash",
                    description: Text(model.emergencyPrivacyMode
                        ? "Emergency privacy stopped refresh and nearby mode. A previous short staging lease may expire after a brief delay."
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
                MatchLocationConsentView(profile: profile)
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
                            model.setGetFkdEnabled(false)
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
            Text("Deck: \(model.deckSource)")
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

    private var getFkdRow: some View {
        VStack(alignment: .leading, spacing: 8) {
            Toggle("Get fk'd", isOn: Binding(
                get: { model.getFkdEnabled },
                set: { model.setGetFkdEnabled($0) }
            ))
            .disabled(model.emergencyPrivacyMode || model.eligibility?.adult != true)
            .accessibilityHint("Turns consent-based nearby encounter mode on or off")

            if model.getFkdEnabled {
                Picker("Nearby profile sharing", selection: $model.proximityDisclosurePolicy) {
                    ForEach(ProximityDisclosurePolicy.allCases) { policy in
                        Text(policy.title).tag(policy)
                    }
                }
                .pickerStyle(.menu)
                Text(model.proximityDisclosurePolicy.detail)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text("STAGING UI ONLY — Bluetooth advertising and scanning are not active. The same prompt-first default applies to every gender.")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.orange)
            } else {
                Text("Off by default. No Bluetooth proximity participation.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            if !model.selectedLookingForModes.isEmpty {
                Text("Looking for: \(model.selectedLookingForModes.map(\.title).sorted().joined(separator: ", "))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
        }
        .padding(10)
        .background(Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 12))
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
                        colors: profile.source == .liveTicket
                            ? [Color.teal.opacity(0.35), Color.blue.opacity(0.25)]
                            : [Color.orange.opacity(0.35), Color.pink.opacity(0.25)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 320)
                .overlay(alignment: .topLeading) {
                    Text(profile.source == .liveTicket ? "LIVE TICKET" : "SYNTHETIC")
                        .font(.caption2.weight(.semibold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(.ultraThinMaterial, in: Capsule())
                        .padding(12)
                }
                .overlay(alignment: .topTrailing) {
                    if let score = model.alignmentScore(for: profile) {
                        Text("\(score)% aligned")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.ultraThinMaterial, in: Capsule())
                            .padding(12)
                            .accessibilityLabel("\(score) percent aligned based on local staging answers")
                    }
                }
                .overlay(alignment: .bottomLeading) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(profile.displayName)
                            .font(.title.bold())
                        Text("\(profile.ageBand) · \(profile.distanceBand)")
                            .font(.subheadline)
                    }
                    .padding()
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("\(profile.displayName), \(profile.ageBand), \(profile.distanceBand)")
            Text(profile.about)
                .font(.body)
            if profile.source == .liveTicket, !profile.ticketIdShort.isEmpty {
                Text("Ticket \(profile.ticketIdShort)… · reciprocal match receipt required")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }
        }
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
                if let score = model.alignmentScore(for: profile) {
                    LabeledContent("Local alignment", value: "\(score)%")
                }
            }
            Section("Privacy") {
                Text("Exact location is never shown by discovery. Pre-match transport is relay-first. Live tickets do not include bio/photos until a consent-scoped capsule fetch is wired.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Text("Alignment is a local compatibility aid, not a prediction of relationship success.")
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
