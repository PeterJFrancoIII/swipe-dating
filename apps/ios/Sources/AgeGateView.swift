import SwiftUI

/// Adults-only age eligibility gate — fail-closed placeholder.
/// Real age assurance integrates via audited core + human-approved vendor.
public struct AgeGateView: View {
    @State private var birthYear: String = ""
    @State private var message: String?

    public init() {}

    public var body: some View {
        Form {
            Section("Age eligibility (18+)") {
                TextField("Birth year (YYYY)", text: $birthYear)
                    .keyboardType(.numberPad)
                Text("Staging stub — no verification performed.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Button("Continue") {
                message = "STUB: age assurance not wired; fail-closed in production path."
            }
            if let message {
                Text(message)
                    .font(.footnote)
                    .foregroundStyle(.orange)
            }
        }
        .navigationTitle("Age Gate")
    }
}
