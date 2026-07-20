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
            if model.emergencyPrivacyMode || !model.availabilityOnline {
                ContentUnavailableView(
                    "Offline for discovery",
                    systemImage: "eye.slash",
                    description: Text(model.emergencyPrivacyMode
                        ? "Emergency privacy mode withdrew presence."
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
                    description: Text("Strict zero-store mode needs peers online. Staging deck exhausted.")
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
    }

    private var availabilityRow: some View {
        HStack {
            Toggle("Available", isOn: $model.availabilityOnline)
                .disabled(model.emergencyPrivacyMode)
            Text(model.coarseRegionLabel)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal)
    }

    @ViewBuilder
    private func accessibilityActions(for profile: SyntheticProfile) -> some View {
        // Swiping must not be the only way to act (Phase 9 requirement).
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
    let profile: SyntheticProfile

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [Color.orange.opacity(0.35), Color.pink.opacity(0.25)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 320)
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
        }
    }
}

struct ProfileDetailView: View {
    let profile: SyntheticProfile
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        List {
            Section("Profile") {
                Text(profile.displayName)
                Text(profile.ageBand)
                Text(profile.distanceBand)
                Text(profile.about)
            }
            Section("Privacy") {
                Text("Exact location is never shown. Pre-match transport is relay-first.")
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
