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
                Text("EMERGENCY PRIVACY ON — presence withdrawn")
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
                Text("STAGING / INTERNAL BETA")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.orange)
                Text("Adults only. Profiles and messages stay on your device. The operator does not get ordinary private content.")
                    .font(.body)
                VStack(alignment: .leading, spacing: 8) {
                    Label("18+ fail-closed age gate", systemImage: "checkmark.shield")
                    Label("No exact location sharing", systemImage: "location.slash")
                    Label("Match before messaging", systemImage: "lock.heart")
                    Label("Block & report always free", systemImage: "hand.raised")
                }
                .font(.subheadline)
                Text("Safety tools reduce risk but cannot prevent screenshots, guarantee identity, or make in-person meetings safe.")
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
                .accessibilityHint("Continue to age eligibility")
            }
            .padding()
        }
        .navigationTitle("Welcome")
    }
}
