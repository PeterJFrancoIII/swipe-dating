export const TESTING_CARD_BANNER = "FAKE - For Internal System Testing Only";

export function testingBanner(
  card: { synthetic?: boolean; testing_banner?: string } | null | undefined,
): string {
  const labeled = card?.testing_banner?.trim();
  if (labeled) {
    return labeled;
  }
  return card?.synthetic ? TESTING_CARD_BANNER : "";
}
