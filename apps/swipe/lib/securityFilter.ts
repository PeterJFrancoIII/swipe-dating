const SECURITY_TERMS = [
  "cyber security",
  "cybersecurity",
  "encryption",
  "encrypt",
  "decrypt",
  "private key",
  "session token",
  "jwt",
  "app attest",
  "attestation bypass",
  "weaken encryption",
  "disable encryption",
  "bypass age",
  "disable age",
  "fail open",
  "operator password",
  "admin password",
  "/operator",
  "sql injection",
  "xss",
  "csrf",
  "rce",
  "0day",
  "zero-day",
  "exploit",
  "keylogger",
  "malware",
  "privilege escalation",
  "pentest",
  "penetration test",
  "csam",
];

export const SECURITY_HOLD_NOTICE =
  "Security stays with admins. This was not added to the community queue.";

export function isSecurityControlRequest(...parts: Array<string | undefined>): boolean {
  const haystack = parts
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase();
  return SECURITY_TERMS.some((term) => haystack.includes(term));
}
