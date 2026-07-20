import SwiftUI

/// Adults-only age eligibility gate — fail-closed via audited core bridge.
public struct AgeGateView: View {
    @State private var birthYear: String = ""
    @State private var message: String?
    @State private var eligibility: DatingCoreBridge.EligibilitySummary?

    public init() {}

    public var body: some View {
        Form {
            Section("Age eligibility (18+)") {
                TextField("Birth year (YYYY)", text: $birthYear)
                    #if os(iOS)
                    .keyboardType(.numberPad)
                    #endif
                if DatingCoreBridge.isStagingFallback {
                    Text("STAGING mock — uses `evaluateMockAgeEligibility` fallback.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                } else {
                    Text("Audited UniFFI core — mock provider only until vendor approved.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            Button("Continue") {
                submitAgeGate()
            }
            if let eligibility {
                Text("Eligible: \(eligibility.adult ? "yes" : "no") via \(eligibility.provider)")
                    .font(.footnote)
                    .foregroundStyle(.green)
            }
            if let message {
                Text(message)
                    .font(.footnote)
                    .foregroundStyle(.orange)
            }
        }
        .navigationTitle("Age Gate")
    }

    private func submitAgeGate() {
        message = nil
        eligibility = nil

        guard let year = Int(birthYear.trimmingCharacters(in: .whitespaces)),
              (1900 ... Calendar.current.component(.year, from: Date())).contains(year)
        else {
            message = "Enter a valid birth year."
            return
        }

        let age = Calendar.current.component(.year, from: Date()) - year
        guard age >= 18 else {
            message = "Must be 18+ to continue."
            return
        }

        do {
            let summary = try DatingCoreBridge.evaluateMockAgeEligibility(
                adult: true,
                ambiguous: false,
                unavailable: false
            )
            let now = Int64(Date().timeIntervalSince1970)
            try DatingCoreBridge.assertDiscoveryAllowed(summary, nowUnix: now)
            eligibility = summary
            message = "Discovery gate passed (protocol v\(DatingCoreBridge.protocolVersion()))."
        } catch DatingCoreBridge.EligibilityError.ineligible {
            message = "Ineligible — fail closed."
        } catch DatingCoreBridge.EligibilityError.expired {
            message = "Eligibility expired — re-verify required."
        } catch DatingCoreBridge.EligibilityError.ambiguous {
            message = "Ambiguous eligibility — fail closed."
        } catch DatingCoreBridge.EligibilityError.providerUnavailable {
            message = "Provider unavailable — fail closed."
        } catch DatingCoreBridge.EligibilityError.revoked {
            message = "Eligibility revoked."
        } catch {
            message = "Unexpected error — fail closed."
        }
    }
}
