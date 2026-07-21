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
                Text("EMERGENCY PRIVACY ON — refresh, nearby mode, and local location grants stopped")
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
                Text("Adults 18+ only. Profiles, private intent, questionnaire answers, messages, and match-scoped location are designed to stay on your device or move through consent-scoped encrypted paths.")
                    .font(.body)
                VStack(alignment: .leading, spacing: 8) {
                    Label("Full-date 18+ staging boundary", systemImage: "checkmark.shield")
                    Label("No exact location in discovery", systemImage: "location.slash")
                    Label("Mutual match before messaging", systemImage: "lock.heart")
                    Label("Get fk'd proximity starts off and prompt-first", systemImage: "wave.3.right")
                    Label("Local alignment — no pay-to-win rank", systemImage: "slider.horizontal.3")
                    Label("Block & report always free", systemImage: "hand.raised")
                }
                .font(.subheadline)
                Text("Safety tools reduce risk but cannot guarantee identity, Bluetooth detection, prevent screenshots, or make in-person meetings safe.")
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
