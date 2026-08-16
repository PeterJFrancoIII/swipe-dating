export type AlignmentBits = {
  alignment?: number | null;
  alignment_answered?: number;
  alignment_total?: number;
  alignment_participating?: boolean;
};

export function alignmentLabel(item: AlignmentBits | null | undefined): string | null {
  if (item == null || !item.alignment_participating || item.alignment == null) {
    return null;
  }
  const answered = item.alignment_answered ?? 0;
  const total = item.alignment_total || 200;
  return `${Math.round(Number(item.alignment))}% · ${answered}/${total}`;
}

export function quizProgressLabel(answered: number, total: number): string {
  if (total <= 0) {
    return "Compatibility quiz";
  }
  return `Compatibility quiz · ${answered}/${total}`;
}
