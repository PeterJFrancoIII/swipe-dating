const MIN_ADULT_AGE = 18;

export function parseDateOnly(raw: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function completedAgeYears(birth: Date, today = new Date()): number {
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - birth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export function adultGate(raw: string, today = new Date()): { ok: true } | { ok: false; error: string } {
  const birth = parseDateOnly(raw);
  if (birth === null) {
    return { ok: false, error: "Enter a real birth date." };
  }
  if (birth.getTime() > Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) {
    return { ok: false, error: "Birth date cannot be in the future." };
  }
  const age = completedAgeYears(birth, today);
  if (age < MIN_ADULT_AGE) {
    return { ok: false, error: "This app is for adults 18 and over." };
  }
  return { ok: true };
}
