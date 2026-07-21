/**
 * Parse an ISO calendar date without allowing local-time-zone drift.
 * @param {string} value YYYY-MM-DD
 * @returns {{ year: number, month: number, day: number } | null}
 */
export function parseDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/**
 * Exact adult boundary for R&D. Leap-day handling uses February 28 in a non-leap
 * eighteenth year; jurisdiction-specific handling remains a legal launch gate.
 * @param {string} birthDate YYYY-MM-DD
 * @param {string} onDate YYYY-MM-DD
 */
export function isAdultOn(birthDate, onDate) {
  const birth = parseDateOnly(birthDate);
  const today = parseDateOnly(onDate);
  if (!birth || !today) return false;

  const todayNumber = today.year * 10_000 + today.month * 100 + today.day;
  const birthNumber = birth.year * 10_000 + birth.month * 100 + birth.day;
  if (birthNumber > todayNumber) return false;

  let adultMonth = birth.month;
  let adultDay = birth.day;
  const adultYear = birth.year + 18;
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(adultYear)) {
    adultDay = 28;
  }
  const adultDateNumber = adultYear * 10_000 + adultMonth * 100 + adultDay;
  return todayNumber >= adultDateNumber;
}

/**
 * Staging credential model. This is deliberately not represented as production
 * age assurance: no real issuer integration or identity document processing exists.
 */
export function createAdultCredential({
  subjectId,
  issuedAtMs,
  expiresAtMs,
  issuer = "staging-mock",
  revoked = false,
}) {
  if (!subjectId) throw new TypeError("subjectId is required");
  if (!Number.isSafeInteger(issuedAtMs) || !Number.isSafeInteger(expiresAtMs)) {
    throw new TypeError("credential timestamps must be safe integers");
  }
  if (expiresAtMs <= issuedAtMs) throw new RangeError("credential must expire after issuance");
  return Object.freeze({ subjectId, issuedAtMs, expiresAtMs, issuer, revoked });
}

export function adultCredentialIsValid(credential, { subjectId, nowMs }) {
  return Boolean(
    credential &&
      credential.subjectId === subjectId &&
      credential.revoked === false &&
      credential.issuedAtMs <= nowMs &&
      nowMs < credential.expiresAtMs,
  );
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
