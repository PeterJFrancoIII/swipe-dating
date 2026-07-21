import SwiftUI

/// Adults-only age eligibility gate — fail-closed via audited core bridge.
public struct AgeGateView: View {
    @EnvironmentObject private var model: AppModel
    @State private var birthDate: Date = Calendar(identifier: .gregorian)
        .date(byAdding: .year, value: -18, to: Date()) ?? Date()
    @State private var confirmedDate = false

    public init() {}

    public var body: some View {
        Form {
            Section {
                Text("This dating service is for adults 18+ only. Parental consent cannot bypass the age floor, and sexual or proximity features are never available to minors.")
                    .font(.footnote)
            }

            Section("Date of birth") {
                DatePicker(
                    "Date of birth",
                    selection: $birthDate,
                    in: ...Date(),
                    displayedComponents: .date
                )
                .datePickerStyle(.compact)
                .accessibilityHint("Used for an exact 18-or-older eligibility check")

                Toggle("I confirm this is my date of birth", isOn: $confirmedDate)

                if model.usingStagingFallback {
                    Text("STAGING mock provider — the date is checked locally. A network-enforced adult credential and provider review are required before real-user beta.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }

            if let error = model.lastError {
                Section {
                    Text(error)
                        .foregroundStyle(.orange)
                        .font(.footnote)
                        .accessibilityLabel("Error: \(error)")
                }
            }

            Section {
                Button("Continue") {
                    model.submitAgeGate(birthDate: birthDate)
                }
                .disabled(!confirmedDate)
                .accessibilityHint("Submit adult eligibility")
            }
        }
        .navigationTitle("Adults only")
        .navigationBarBackButtonHidden(true)
    }
}
