export function payloadFromFailedResponse(
  status: number,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  if (typeof payload.error === "string" && payload.error) {
    return payload;
  }
  if (status === 413) {
    return {
      error: "That photo is too large. Try a smaller one.",
      code: "photo_too_large",
    };
  }
  return { error: "Request failed", code: String(payload.code ?? "") };
}
