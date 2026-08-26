export const SAFETY_REPORT_OPTIONS = [
  { id: "under_18", label: "Appears under 18" },
  { id: "ncii", label: "Non-consensual intimate images" },
] as const;

export function mergeSafetyReportOptions(
  incoming: readonly { id: string; label: string }[] | null | undefined,
): { id: string; label: string }[] {
  const seen = new Set<string>();
  const merged: { id: string; label: string }[] = [];
  for (const option of [...SAFETY_REPORT_OPTIONS, ...(incoming ?? [])]) {
    if (!option.id || seen.has(option.id)) {
      continue;
    }
    seen.add(option.id);
    merged.push({ id: option.id, label: option.label });
  }
  return merged;
}
