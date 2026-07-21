import SwiftUI

/// Adults-only age eligibility gate — fail-closed via audited core bridge.
public struct AgeGateView: View {
    @EnvironmentObject private var model: AppModel
    @State private var birthDate = Date(timeIntervalSince1970: 946_684_800) // 2000-01-01 UTC

    public init() {}

    public var body: some View {
        Form {
            Section {
                Text("This dating service is for adults 18+ only. Parental consent cannot bypass this floor.")
                    .font(.footnote)
                Text("Adults ages 18–25 are a design audience, but nobody under 18 may enter discovery, proximity, sexual-intent, map, match, or messaging features.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Section("Adult eligibility") {
                DatePicker(
                    "Date of birth",
                    selection: $birthDate,
                    in: ...Date(),
                    displayedComponents: .date
                )
                .datePickerStyle(.compact)
                .accessibilityHint("Your full birth date is used for the staging 18th-birthday boundary check")

                if model.usingStagingFallback {
                    Text("STAGING mock provider — production requires a signed, expiring, revocable adult credential enforced by the network.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            if let err = model.lastError {
                Section {
                    Text(err)
                        .foregroundStyle(.orange)
                        .font(.footnote)
                        .accessibilityLabel("Error: \(err)")
                }
            }
            Section {
                Button("Continue") {
                    model.submitAgeGate(birthDate: birthDate)
                }
                .accessibilityHint("Submit adult eligibility")
            }
        }
        .navigationTitle("Age Gate")
        .navigationBarBackButtonHidden(true)
    }
}
