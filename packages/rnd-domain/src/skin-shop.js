export const ALLOWED_SKIN_MIME_TYPES = Object.freeze(
  new Set([
    "image/png",
    "image/webp",
    "image/avif",
    "image/svg+xml;profile=swipe-safe-v1",
    "application/vnd.swipe.animation+json",
  ]),
);

export function validateSkinManifest(manifest) {
  const reasons = [];
  if (!manifest?.assetId || !manifest?.creatorId) reasons.push("missing_identity");
  if (!ALLOWED_SKIN_MIME_TYPES.has(manifest?.mimeType)) reasons.push("mime_not_allowed");
  if (!Number.isSafeInteger(manifest?.byteLength) || manifest.byteLength <= 0 || manifest.byteLength > 8 * 1024 * 1024) {
    reasons.push("byte_limit");
  }
  if (
    !Number.isInteger(manifest?.width) ||
    !Number.isInteger(manifest?.height) ||
    manifest.width <= 0 ||
    manifest.height <= 0 ||
    manifest.width > 4096 ||
    manifest.height > 4096
  ) {
    reasons.push("dimension_limit");
  }
  if (!Number.isInteger(manifest?.frameCount) || manifest.frameCount < 1 || manifest.frameCount > 240) {
    reasons.push("frame_limit");
  }
  if (!/^[a-f0-9]{64}$/i.test(manifest?.integritySha256 ?? "")) {
    reasons.push("invalid_integrity_hash");
  }
  if ((manifest?.remoteReferences ?? []).length > 0) reasons.push("remote_references_forbidden");
  return Object.freeze({ valid: reasons.length === 0, reasons: Object.freeze(reasons) });
}
