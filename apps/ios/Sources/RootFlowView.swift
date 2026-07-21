import SwiftUI

/// Owns onboarding → main tabs for the staging iPhone client.
struct RootFlowView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        Group {
            if model.onboarding == .ready {
                MainTabView()
            } else {
                OnboardingFlowView()
            }
        }
        .overlay(alignment: .top) {
            if model.emergencyPrivacyMode {
                Text("EMERGENCY PRIVACY ON — discovery/proximity stopped; active location grants cleared")
                    .font(.caption.bold())
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(8)
                    .background(Color.red)
                    .accessibilityAddTraits(.isHeader)
            }
        }
    }
}

struct OnboardingFlowView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        NavigationStack {
            Group {
                switch model.onboarding {
                case .welcome:
                    WelcomeView()
                case .ageGate:
                    AgeGateView()
                case .identity:
                    IdentitySetupView()
                case .permissions:
                    PermissionsEducationView()
                case .profile:
                    ProfileSetupView()
                case .ready:
                    EmptyView()
                }
            }
            .toolbar {
                ToolbarItem(placement: .principal) {
                    StagingBannerView()
                }
            }
        }
    }
}

struct WelcomeView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("LocalFirst Dating")
                    .font(.largeTitle.bold())
                    .accessibilityAddTraits(.isHeader)
                Text("STAGING / INTERNAL — ADULTS 18+ ONLY")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.orange)

                Text("A consent-driven, local-first dating experience designed especially for adults 18–25 while remaining open to eligible adults. Ordinary profiles, preferences, and messages stay primarily on your device.")
                    .font(.body)

                VStack(alignment: .leading, spacing: 8) {
                    Label("Exact-date 18+ gate", systemImage: "checkmark.shield")
                    Label("Private Looking For and alignment controls", systemImage: "slider.horizontal.3")
                    Label("Optional Get fk'd nearby alerts", systemImage: "dot.radiowaves.left.and.right")
                    Label("Optional expiring match-location grants", systemImage: "map")
                    Label("Skin Shop previews isolated from dating data", systemImage: "paintpalette")
                    Label("Match before messaging", systemImage: "lock.heart")
                    Label("Block & report always free", systemImage: "hand.raised")
                }
                .font(.subheadline)

                Text("No minor access, forced gender-based disclosure, covert tracking, public sexual-intent broadcast, protected-trait ranking, or paid bypass of safety controls.")
                    .font(.footnote.weight(.semibold))

                Text("Safety tools reduce risk but cannot prevent screenshots, guarantee identity, ensure a Bluetooth alert, or make in-person meetings safe.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                Text("Protocol v\(model.protocolVersion) · Core: \(model.usingStagingFallback ? "STAGING mock" : "UniFFI")")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)

                Button("Continue") {
                    model.completeWelcome()
                }
                .buttonStyle(.borderedProminent)
                .frame(maxWidth: .infinity)
                .accessibilityHint("Continue to adult eligibility")
            }
            .padding()
        }
        .navigationTitle("Welcome")
    }
}
