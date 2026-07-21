import SwiftUI

struct SafetyCenterView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        List {
            Section {
                StagingBannerView()
                Text("Safety tools are free. They reduce risk but cannot guarantee identity, Bluetooth detection, prevent screenshots, or make meetings safe.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Section("Emergency") {
                Toggle("Emergency privacy mode", isOn: Binding(
                    get: { model.emergencyPrivacyMode },
                    set: { _ in model.toggleEmergencyPrivacy() }
                ))
                .accessibilityHint("Stops presence refresh, nearby mode, and local location grants; a prior short staging lease may expire after a delay")
                Text("Emergency privacy disables Get fk'd and clears staging location choices. Production requires an authenticated immediate withdrawal path; short TTL remains a fallback.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Section("Blocked") {
                if model.blockedIds.isEmpty {
                    Text("No blocked profiles")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(Array(model.blockedIds).sorted(), id: \.self) { id in
                        Text(id)
                            .font(.caption.monospaced())
                    }
                }
            }
            Section("Active privacy state") {
                LabeledContent("Get fk'd", value: model.getFkdEnabled ? "on (UI only)" : "off")
                LabeledContent("Location grants", value: "\(model.locationShareByMatch.count) staging choice(s)")
                LabeledContent("Blocked", value: "\(model.blockedIds.count)")
            }
            Section("Resources") {
                Text("If you are in immediate danger, contact local emergency services. This app does not dispatch police.")
                    .font(.footnote)
                Text("Child-safety, NCII, proximity abuse, location coercion, and marketplace legal reporting are human-owned processes — not operational in this staging build.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Safety")
    }
}

struct ReportFlowView: View {
    let profile: SyntheticProfile
    @Environment(\.dismiss) private var dismiss
    @State private var reason: ReportReason = .harassment
    @State private var includeSelectedEvidence = true
    @State private var submitted = false

    enum ReportReason: String, CaseIterable, Identifiable {
        case harassment = "Harassment / contact after block"
        case proximity = "Proximity stalking or Bluetooth harvesting"
        case location = "Location coercion or misuse"
        case scam = "Scam, bot, or impersonation"
        case ncii = "Nonconsensual intimate imagery"
        case minor = "Suspected minor / age evasion"
        case groupConsent = "Group participant or consent abuse"
        case marketplace = "Skin Shop impersonation or malicious asset"
        case threat = "Credible threat"
        case other = "Other prohibited conduct"
        var id: String { rawValue }
    }

    var body: some View {
        Form {
            Section("Reporting \(profile.displayName)") {
                Text("You choose what evidence is submitted. Staging stores hashes/metadata only — no automatic upload of your whole gallery, BLE history, or location history.")
                    .font(.footnote)
            }
            Section("Reason") {
                Picker("Reason", selection: $reason) {
                    ForEach(ReportReason.allCases) { item in
                        Text(item.rawValue).tag(item)
                    }
                }
            }
            Section("Evidence") {
                Toggle("Include selected message/profile evidence package", isOn: $includeSelectedEvidence)
                Text("Exact contents of the package are shown before send in production. Staging simulates confirmation only.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            if submitted {
                Text("Report recorded locally for staging. Human review queues are not staffed in this build.")
                    .foregroundStyle(.green)
                    .font(.footnote)
            }
            Button(submitted ? "Done" : "Submit report") {
                if submitted {
                    dismiss()
                } else {
                    submitted = true
                }
            }
        }
        .navigationTitle("Report")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Close") { dismiss() }
            }
        }
    }
}

struct SettingsView: View {
    @EnvironmentObject private var model: AppModel
    @State private var confirmDelete = false

    var body: some View {
        List {
            Section {
                StagingBannerView()
            }
            Section("Discovery & expression") {
                NavigationLink("Preferences & alignment") {
                    PreferenceCenterView()
                }
                NavigationLink("Skin Shop") {
                    SkinShopView()
                }
                NavigationLink("Matched location map") {
                    MatchMapView()
                }
            }
            Section("Privacy modes") {
                Toggle("Relay-only (recommended)", isOn: $model.relayOnly)
                Toggle("Sealed mailbox opt-in (off by default)", isOn: $model.sealedMailboxOptIn)
                Text("Sealed mailbox stores encrypted envelopes the operator cannot read. Disabled by default.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                LabeledContent("Nearby disclosure", value: model.proximityDisclosurePolicy.title)
            }
            Section("Account") {
                LabeledContent("Display name", value: model.displayName)
                LabeledContent("Protocol", value: "v\(model.protocolVersion)")
                LabeledContent("Core", value: model.usingStagingFallback ? "STAGING mock" : "UniFFI")
                NavigationLink("Diagnostics (internal)") {
                    DiagnosticsView()
                }
            }
            Section("Data") {
                Button("Export local data (staging stub)") {}
                Button("Delete account on this device", role: .destructive) {
                    confirmDelete = true
                }
            }
        }
        .navigationTitle("Settings")
        .confirmationDialog("Delete local account?", isPresented: $confirmDelete, titleVisibility: .visible) {
            Button("Delete everything on this device", role: .destructive) {
                model.deleteLocalAccount()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This destroys local keys and data on this phone. It cannot erase copies peers already received.")
        }
    }
}

struct DiagnosticsView: View {
    @EnvironmentObject private var model: AppModel
    @State private var serviceStatuses: [ControlPlaneClient.ServiceStatus] = []
    @State private var probing = false

    var body: some View {
        List {
            Section("Redacted technical state") {
                LabeledContent("Eligibility provider", value: model.eligibility?.provider ?? "none")
                LabeledContent("Adult", value: model.eligibility?.adult == true ? "yes" : "no")
                LabeledContent("Core path", value: model.usingStagingFallback ? "STAGING mock" : "UniFFI linked")
                LabeledContent("Profile id", value: model.profileIdHex.isEmpty ? "none" : String(model.profileIdHex.prefix(16)) + "…")
                LabeledContent("Online", value: model.availabilityOnline ? "yes" : "no")
                LabeledContent("Matches", value: "\(model.matches.count)")
                LabeledContent("Blocked", value: "\(model.blockedIds.count)")
                LabeledContent("Region band", value: model.coarseRegionLabel)
                LabeledContent("Get fk'd", value: model.getFkdEnabled ? "UI on / BLE off" : "off")
                LabeledContent("Nearby disclosure", value: model.proximityDisclosurePolicy.title)
                LabeledContent("Looking For", value: "\(model.selectedLookingForModes.count) mode(s)")
                LabeledContent("Questionnaire", value: "\(model.alignmentAnswers.count) answer(s)")
                LabeledContent("Location grants", value: "\(model.locationShareByMatch.count) synthetic")
                LabeledContent("Skin", value: model.selectedSkinID ?? "default")
            }
            Section("Local control plane") {
                Text("Probes Mac `127.0.0.1:8080–8085` (`make smoke-local`). Failures are expected if services are down.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Button(probing ? "Probing…" : "Probe /healthz") {
                    Task { await probe() }
                }
                .disabled(probing)
                ForEach(serviceStatuses) { status in
                    LabeledContent("\(status.name):\(status.port)") {
                        Text(status.ok ? "ok" : "down")
                            .foregroundStyle(status.ok ? .green : .orange)
                    }
                }
            }
            Section {
                Text("No profile text, messages, exact location, BLE encounter IDs, sexual intent, questionnaire answers, or secrets are logged.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Diagnostics")
    }

    @MainActor
    private func probe() async {
        probing = true
        defer { probing = false }
        serviceStatuses = await ControlPlaneClient().probeAll()
    }
}
