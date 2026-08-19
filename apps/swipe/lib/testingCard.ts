export const TESTING_CARD_BANNER = "FAKE - For Internal System Testing Only";

export function testingBanner(
  card: { synthetic?: boolean; testing_banner?: string } | null | undefined,
  options: { internal?: boolean } = {},
): string {
  const showMarks =
    options.internal ?? (typeof __DEV__ !== "undefined" && __DEV__ === true);
  if (!showMarks) {
    return "";
  }
  const labeled = card?.testing_banner?.trim();
  if (labeled) {
    return labeled;
  }
  return card?.synthetic ? TESTING_CARD_BANNER : "";
}
