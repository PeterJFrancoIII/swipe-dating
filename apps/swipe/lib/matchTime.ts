export function formatRemaining(ms: number | undefined): string {
  if (ms == null) {
    return "";
  }
  if (ms <= 0) {
    return "EXPIRED";
  }
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) {
    return `${Math.max(1, minutes)}m left`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    return `${hours}h left`;
  }
  return `${Math.floor(hours / 24)}d left`;
}

export function statusLabel(status: string | undefined): string {
  switch (status) {
    case "matched":
      return "Say hi";
    case "awaiting_reply":
      return "Waiting";
    case "active":
      return "Active";
    case "expired_no_reply":
    case "expired_inactive":
      return "EXPIRED";
    default:
      return "";
  }
}

export function isExpired(status: string | undefined): boolean {
  return status === "expired_no_reply" || status === "expired_inactive";
}
