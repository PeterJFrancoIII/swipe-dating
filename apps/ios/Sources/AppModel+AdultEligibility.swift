import Foundation

extension AppModel {
    /// Staging date-of-birth boundary check. Production still requires a network-enforced,
    /// signed, expiring, revocable adult-eligibility credential.
    func submitAgeGate(birthDate: Date) {
        lastError = nil

        let calendar = Calendar(identifier: .gregorian)
        let today = Date()
        guard birthDate <= today,
              let eighteenthBirthday = calendar.date(byAdding: .year, value: 18, to: birthDate) else {
            lastError = "Enter a valid date of birth."
            return
        }
        guard eighteenthBirthday <= today else {
            lastError = "Must be 18+ to continue."
            return
        }

        do {
            let summary = try DatingCoreBridge.evaluateMockAgeEligibility(
                adult: true,
                ambiguous: false,
                unavailable: false
            )
            let now = Int64(today.timeIntervalSince1970)
            try DatingCoreBridge.assertDiscoveryAllowed(summary, nowUnix: now)
            eligibility = summary
            onboarding = .identity
        } catch {
            lastError = "Age eligibility failed closed: \(error.localizedDescription)"
        }
    }
}
