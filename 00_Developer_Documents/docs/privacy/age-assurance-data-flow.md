# Age Assurance Data Flow (Draft)

**Status:** UNAPPROVED — staging mock only

1. Device obtains platform age-range signal or mock provider verdict.
2. Core derives `EligibilityCredential` (adult boolean / age band / expiry).
3. Discovery is refused unless credential is adult and unexpired.
4. Identity documents, selfies, and biometric templates are **never** retained by the operator.
5. Real providers remain disabled until DPA/security/legal metadata exists.
