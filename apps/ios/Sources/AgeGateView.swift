import SwiftUI

/// Adults-only age eligibility gate — fail-closed via audited core bridge.
public struct AgeGateView: View {
    @EnvironmentObject private var model: AppModel
    @State private var birthYear: String = ""

    public init() {}

    public var body: some View {
        Form {
            Section {
                Text("Confirm you are 18 or older. Parental consent cannot bypass this floor.")
                    .font(.footnote)
            }
            Section("Age eligibility (18+)") {
                TextField("Birth year (YYYY)", text: $birthYear)
                    #if os(iOS)
                    .keyboardType(.numberPad)
                    #endif
                    .accessibilityLabel("Birth year")
                if model.usingStagingFallback {
                    Text("STAGING mock provider — real age vendors disabled until DPA/legal review.")
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
                    if let year = Int(birthYear.trimmingCharacters(in: .whitespaces)) {
                        model.submitAgeGate(birthYear: year)
                    } else {
                        model.lastError = "Enter a valid birth year."
                    }
                }
                .accessibilityHint("Submit age eligibility")
            }
        }
        .navigationTitle("Age Gate")
        .navigationBarBackButtonHidden(true)
    }
}
