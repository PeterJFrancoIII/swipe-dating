export const RISK_ACTION = Object.freeze({
  ALLOW: "allow",
  THROTTLE: "throttle",
  CHALLENGE: "challenge",
  TEMPORARY_CONTAINMENT: "temporary_containment",
  DENY: "deny",
});

export function assessRisk(signals) {
  if (!signals.adultCredentialValid) {
    return freezeAssessment(100, RISK_ACTION.DENY, ["adult_credential_invalid"]);
  }
  if (signals.attestation === "failed") {
    return freezeAssessment(100, RISK_ACTION.DENY, ["attestation_failed"]);
  }

  let score = 0;
  const reasons = [];
  const attestationPenalty = {
    hardware_backed: 0,
    software_fallback: 8,
    unsupported: 20,
    missing: 30,
  }[signals.attestation ?? "unsupported"] ?? 25;
  if (attestationPenalty) {
    score += attestationPenalty;
    reasons.push("lower_trust_device");
  }

  const add = (condition, points, reason) => {
    if (!condition) return;
    score += points;
    reasons.push(reason);
  };

  const accounts = signals.accountsCreated24h ?? 0;
  add(accounts > 2, Math.min(48, (accounts - 2) * 12), "mass_registration");
  add((signals.presencePublishesMinute ?? 0) > 12, 20, "presence_flood");
  add((signals.discoveryRequestsMinute ?? 0) > 120, 20, "discovery_scraping");
  add((signals.profileFetchesMinute ?? 0) > 100, 25, "profile_scraping");
  add((signals.likesMinute ?? 0) > 60, 25, "automated_liking");
  add(
    (signals.bleReplayHits24h ?? 0) > 0,
    Math.min(40, (signals.bleReplayHits24h ?? 0) * 10),
    "ble_replay",
  );
  add(signals.impossibleTravel === true, 25, "impossible_travel");
  add(
    (signals.maliciousLinkHits24h ?? 0) > 0,
    Math.min(40, (signals.maliciousLinkHits24h ?? 0) * 20),
    "malicious_links",
  );
  add((signals.reportBrigadeScore ?? 0) > 50, 20, "report_brigading");
  add(
    (signals.priorEnforcementCount ?? 0) > 0,
    Math.min(30, (signals.priorEnforcementCount ?? 0) * 10),
    "prior_enforcement",
  );

  score = Math.min(100, score);
  const action =
    score >= 80
      ? RISK_ACTION.TEMPORARY_CONTAINMENT
      : score >= 55
        ? RISK_ACTION.CHALLENGE
        : score >= 30
          ? RISK_ACTION.THROTTLE
          : RISK_ACTION.ALLOW;
  return freezeAssessment(score, action, reasons);
}

function freezeAssessment(score, action, reasons) {
  return Object.freeze({ score, action, reasons: Object.freeze(reasons) });
}
