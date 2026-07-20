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
            if let err = model.lastError {
                Text(err).foregroundStyle(.orange).font(.footnote)
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
                Text("We only use foreground location to derive a coarse region with jitter. Exact coordinates never leave the device. Distance is shown as bands like “nearby”, never meters.")
                    .font(.footnote)
                Toggle("Use coarse discovery region", isOn: $allowCoarse)
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
            Section {
                Text("Region band: \(model.coarseRegionLabel)")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            if let err = model.lastError {
                Text(err).foregroundStyle(.orange).font(.footnote)
            }
            Button("Save & start discovering") {
                model.saveProfile()
            }
            .buttonStyle(.borderedProminent)
        }
        .navigationTitle("Your profile")
        .navigationBarBackButtonHidden(true)
    }
}
