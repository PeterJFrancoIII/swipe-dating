import Foundation

extension AppModel {
    /// Full-date staging boundary check. Production still requires a signed,
    /// expiring, revocable adult credential enforced by the network.
    func submitAgeGate(
        birthDate: Date,
        now: Date = Date(),
        calendar: Calendar = .current
    ) {
        lastError = nil

        let today = calendar.startOfDay(for: now)
        let birthday = calendar.startOfDay(for: birthDate)

        guard birthday <= today else {
            lastError = "Enter a valid date of birth."
            return
        }

        guard let oldestPlausibleBirthday = calendar.date(
            byAdding: .year,
            value: -120,
            to: today
        ), birthday >= oldestPlausibleBirthday else {
            lastError = "Enter a valid date of birth."
            return
        }

        guard let adultCutoff = calendar.date(
            byAdding: .year,
            value: -18,
            to: today
        ), birthday <= adultCutoff else {
            lastError = "Must be 18+ to continue."
            return
        }

        do {
            let summary = try DatingCoreBridge.evaluateMockAgeEligibility(
                adult: true,
                ambiguous: false,
                unavailable: false
            )
            let nowUnix = Int64(now.timeIntervalSince1970)
            try DatingCoreBridge.assertDiscoveryAllowed(summary, nowUnix: nowUnix)
            eligibility = summary
            onboarding = .identity
        } catch {
            lastError = "Adult eligibility failed closed: \(error.localizedDescription)"
        }
    }
}
