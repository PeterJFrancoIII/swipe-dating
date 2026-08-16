export const PROFILE_PHOTO_LONG_EDGE = 2400;
export const PROFILE_PHOTO_SHORT_EDGE = 1080;

export type PickedPhoto = {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string | null;
  mimeType?: string | null;
};

export type PhotoUploadPart = {
  uri: string;
  name: string;
  type: string;
};

export function photoMimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) {
    return "image/heic";
  }
  if (lower.endsWith(".avif")) {
    return "image/avif";
  }
  if (lower.endsWith(".png")) {
    return "image/png";
  }
  if (lower.endsWith(".webp")) {
    return "image/webp";
  }
  return "image/jpeg";
}

export function isDefaultPhotoFormat(mime?: string | null, name?: string | null): boolean {
  const type = (mime?.trim() || photoMimeFromName(name || "")).toLowerCase();
  return type === "image/heic" || type === "image/heif";
}

export function heicUploadPart(uri: string, index: number): PhotoUploadPart {
  return { uri, name: `photo-${index + 1}.heic`, type: "image/heic" };
}

export function photoUploadFallback(asset: PickedPhoto, index: number): PhotoUploadPart {
  if (isDefaultPhotoFormat(asset.mimeType, asset.fileName)) {
    return heicUploadPart(asset.uri, index);
  }
  const name = asset.fileName?.trim() || `photo-${index + 1}.heic`;
  const type = asset.mimeType?.trim() || photoMimeFromName(name);
  return { uri: asset.uri, name, type };
}

export function photoAcceptHeader(os: string): string {
  if (os === "ios") {
    return "image/heic,image/heif,image/avif,image/webp,*/*";
  }
  return "image/avif,image/webp,*/*";
}

export function photoResizeAction(
  width?: number,
  height?: number,
): { resize: { width: number; height?: number } }[] {
  if (width && height) {
    return [{ resize: fitPhoneRaster(width, height) }];
  }
  return [{ resize: { width: PROFILE_PHOTO_SHORT_EDGE } }];
}

export function fitPhoneRaster(width: number, height: number): { width: number; height: number } {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const scale = Math.min(
    PROFILE_PHOTO_LONG_EDGE / Math.max(safeWidth, safeHeight),
    PROFILE_PHOTO_SHORT_EDGE / Math.min(safeWidth, safeHeight),
    1,
  );
  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
  };
}
