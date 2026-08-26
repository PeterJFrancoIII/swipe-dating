export function isTestingCard(
  card: { synthetic?: boolean; testing_banner?: string } | null | undefined,
): boolean {
  return Boolean(card?.testing_banner?.trim() || card?.synthetic);
}

export function deckActionsLocked(
  remaining: number | undefined,
  card: { synthetic?: boolean; testing_banner?: string } | null | undefined,
): boolean {
  if (isTestingCard(card)) {
    return false;
  }
  return remaining === 0;
}

export function swipeReachLabel(remaining: number | undefined, locked: boolean): string {
  if (locked) {
    return "Out of free swipes today";
  }
  const count = remaining ?? "—";
  const noun = remaining === 1 ? "swipe" : "swipes";
  return `${count} ${noun} left`;
}

export function grantedInventoryAvailable(remaining: number | undefined): boolean {
  return (remaining ?? 0) > 0;
}

export function grantedBoostCaption(boosts: number | undefined): string {
  const count = boosts ?? 0;
  if (count < 1) {
    return "";
  }
  return ` · ${count} granted Boost${count === 1 ? "" : "s"}`;
}
