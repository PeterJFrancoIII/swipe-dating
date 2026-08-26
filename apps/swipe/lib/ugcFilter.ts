/** Fail-closed child-safety / trafficking filter. Adult sexual content is allowed. */

const BLOCKED: RegExp[] = [
  /\bunder\s*18\b/i,
  /\bunderage\b/i,
  /\b(csam|child\s*porn|childporn|child\s*sexual)\b/i,
  /\b(loli|lolita|shota)\b/i,
  /\b(1[0-7]|[1-9])\s*[- ]?year[s]?\s*[- ]?old\b/i,
  /\b(minor|minors)\b.{0,24}\b(sex|sexual|nude|naked|porn|date|dating|hookup)\b/i,
  /\b(sex|sexual|nude|naked|porn|date|dating|hookup)\b.{0,24}\b(minor|minors)\b/i,
  /\b(traffick|trafficking|sell (her|him|them) for sex)\b/i,
];

export const UGC_BLOCKED_NOTICE =
  "That text is not allowed. Get fk'd is adults 18+ only. No one under 18, and no trafficking.";

export function ugcRejection(text: string): string | null {
  const value = text.trim();
  if (!value) {
    return null;
  }
  return BLOCKED.some((pattern) => pattern.test(value)) ? UGC_BLOCKED_NOTICE : null;
}
