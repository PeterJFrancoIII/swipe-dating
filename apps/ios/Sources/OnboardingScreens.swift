import SwiftUI

struct IdentitySetupView: View {
    @EnvironmentObject private var model: AppModel
    @State private var acknowledged = false

    var body: some View {
        Form {
            Section("Local identity") {
                Text("A device-local identity will be created. Root secrets never leave this phone in staging.")
                    .font(.footnote)
                Toggle("I understand recovery is my responsibility (export kit later)", isOn: $acknowledged)
                    .accessibilityHint("Required before creating identity")
            }
            Section("Recovery") {
                Text("Biometrics may unlock the app but are not the only recovery path. Losing all devices and recovery material means losing the account.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            if !model.profileIdHex.isEmpty {
                Section("Public summary (safe to display)") {
                    LabeledContent("Profile id") {
                        Text(String(model.profileIdHex.prefix(16)) + "…")
                            .font(.system(.caption, design: .monospaced))
                    }
                    LabeledContent("Root pubkey") {
                        Text(String(model.rootPublicKeyHex.prefix(16)) + "…")
                            .font(.system(.caption, design: .monospaced))
                    }
                }
            }
            if let error = model.lastError {
                Text(error).foregroundStyle(.orange).font(.footnote)
            }
            Button("Create local identity") {
                model.createLocalIdentity(acknowledgeRecovery: acknowledged)
            }
            .disabled(!acknowledged)
        }
        .navigationTitle("Identity")
        .navigationBarBackButtonHidden(true)
    }
}

struct PermissionsEducationView: View {
    @EnvironmentObject private var model: AppModel
    @State private var allowCoarse = true

    var body: some View {
        Form {
            Section("Location (optional)") {
                Text("We only use foreground location to derive a coarse region with jitter. Exact coordinates never leave your device during discovery. Turning this off now disables location-based presence rather than substituting a hidden region.")
                    .font(.footnote)
                Toggle("Use coarse discovery region", isOn: $allowCoarse)
            }

            Section("Get fk'd proximity (off by default)") {
                Text("Bluetooth permission is requested only when you turn the adult-only proximity mode on. The same prompt-before-profile-sharing default applies to every gender.")
                    .font(.footnote)
                Text("Background delivery is best-effort and must pass battery, replay, stalking, blocked-user, and attestation tests before real-user beta.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Photos") {
                Text("Profile photos stay on-device. GPS/camera metadata is stripped before any peer transfer.")
                    .font(.footnote)
            }

            Button("Continue") {
                model.finishPermissions(enableCoarseRegion: allowCoarse)
            }
        }
        .navigationTitle("Permissions")
        .navigationBarBackButtonHidden(true)
    }
}

struct ProfileSetupView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        Form {
            Section("Profile (on-device)") {
                TextField("Display name", text: $model.displayName)
                    .accessibilityLabel("Display name")
                TextField("About", text: $model.aboutText, axis: .vertical)
                    .lineLimit(4 ... 8)
                    .accessibilityLabel("About text")
            }

            Section("Identity (optional)") {
                Picker("Gender identity", selection: $model.genderIdentity) {
                    ForEach(GenderIdentity.allCases) { value in
                        Text(value.rawValue).tag(value)
                    }
                }
                Picker("Sexual orientation", selection: $model.sexualOrientation) {
                    ForEach(SexualOrientation.allCases) { value in
                        Text(value.rawValue).tag(value)
                    }
                }
                Text("These are separate, optional fields. They do not change proximity or location privacy defaults.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Looking for") {
                ForEach(LookingForMode.allCases) { mode in
                    Toggle(mode.rawValue, isOn: lookingForBinding(mode))
                }
                Text("Sexual modes are available only after adult eligibility and are shared only with independently compatible adults.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section {
                Text("Region band: \(model.coarseRegionLabel)")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            if let error = model.lastError {
                Text(error).foregroundStyle(.orange).font(.footnote)
            }

            Button("Save & start discovering") {
                model.saveProfile()
            }
            .buttonStyle(.borderedProminent)
        }
        .navigationTitle("Your profile")
        .navigationBarBackButtonHidden(true)
    }

    private func lookingForBinding(_ mode: LookingForMode) -> Binding<Bool> {
        Binding(
            get: { model.lookingForModes.contains(mode) },
            set: { enabled in
                if enabled { model.lookingForModes.insert(mode) }
                else { model.lookingForModes.remove(mode) }
            }
        )
    }
}
