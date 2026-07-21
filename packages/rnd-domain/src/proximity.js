export const PROXIMITY_DISCLOSURE = Object.freeze({
  OFF: "off",
  PROMPT_BEFORE_SHARING: "prompt_before_sharing",
  AUTO_SHARE_COMPATIBLE: "auto_share_compatible",
});

export const PROXIMITY_DECISION = Object.freeze({
  SUPPRESS: "suppress",
  BUZZ_ONLY: "buzz_only",
  BUZZ_AND_PROMPT: "buzz_and_prompt",
  BUZZ_AND_SHARE_SCOPED_CAPABILITY: "buzz_and_share_scoped_capability",
});

export function decideProximityEvent({
  adultCredentialValid,
  disclosure = PROXIMITY_DISCLOSURE.OFF,
  emergencyPrivacy = false,
  blocked = false,
  withinHapticCooldown = false,
  independentlyCompatible = false,
}) {
  if (
    !adultCredentialValid ||
    disclosure === PROXIMITY_DISCLOSURE.OFF ||
    emergencyPrivacy ||
    blocked ||
    withinHapticCooldown
  ) {
    return PROXIMITY_DECISION.SUPPRESS;
  }

  if (!independentlyCompatible) return PROXIMITY_DECISION.BUZZ_ONLY;
  if (disclosure === PROXIMITY_DISCLOSURE.PROMPT_BEFORE_SHARING) {
    return PROXIMITY_DECISION.BUZZ_AND_PROMPT;
  }
  return PROXIMITY_DECISION.BUZZ_AND_SHARE_SCOPED_CAPABILITY;
}
