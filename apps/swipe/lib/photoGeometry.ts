export const PROFILE_PHOTO_LONG_EDGE = 2400;
export const PROFILE_PHOTO_SHORT_EDGE = 1080;

export type PickedPhoto = {
  uri: string;
  assetId?: string | null;
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

export type PhotoPrepareProgress = {
  onStart?: (index: number, total: number) => void;
  onDone?: (index: number, total: number) => void;
};

export type PhotoPrepareIO = {
  stage: (asset: PickedPhoto, index: number) => Promise<PickedPhoto>;
  encode?: (uri: string) => Promise<{ uri: string }>;
};

export const AMBIGUOUS_PHOTO_PICK_MESSAGE =
  "Couldn't reliably identify all selected photos; try selecting them individually.";

export const PHOTO_STAGE_FAILED_MESSAGE = "Could not copy that photo from the library.";

export function pickIdentity(asset: { assetId?: string | null; uri: string }): string {
  const id = asset.assetId?.trim();
  if (id) {
    return `id:${id}`;
  }
  return `uri:${asset.uri}`;
}

export function uniquePickedPhotos<T extends { assetId?: string | null; uri: string }>(assets: T[]): T[] {
  const seenIds = new Set<string>();
  const out: T[] = [];
  for (const asset of assets) {
    const id = asset.assetId?.trim();
    if (id) {
      if (seenIds.has(id)) {
        continue;
      }
      seenIds.add(id);
    }
    out.push(asset);
  }
  return out;
}

export function assertIdentifiablePicks<T extends { assetId?: string | null; uri: string }>(assets: T[]): T[] {
  const unique = uniquePickedPhotos(assets);
  const uriOwners = new Map<string, string>();
  for (const asset of unique) {
    const id = asset.assetId?.trim() || "";
    const previous = uriOwners.get(asset.uri);
    if (previous === undefined) {
      uriOwners.set(asset.uri, id);
      continue;
    }
    if (!id || !previous) {
      throw new Error(AMBIGUOUS_PHOTO_PICK_MESSAGE);
    }
  }
  return unique;
}

export function isPhotoPickIdentityError(cause: unknown): boolean {
  return (
    cause instanceof Error &&
    (cause.message === AMBIGUOUS_PHOTO_PICK_MESSAGE || cause.message === PHOTO_STAGE_FAILED_MESSAGE)
  );
}

export async function resolveStagedPick(
  asset: PickedPhoto,
  index: number,
  io: {
    stageLibrary?: (uri: string, assetId: string) => Promise<{ uri: string }>;
    copyPicker: (asset: PickedPhoto, index: number) => Promise<PickedPhoto>;
  },
): Promise<PickedPhoto> {
  const assetId = asset.assetId?.trim() || "";
  if (assetId) {
    if (!io.stageLibrary) {
      throw new Error(PHOTO_STAGE_FAILED_MESSAGE);
    }
    try {
      const staged = await io.stageLibrary(asset.uri, assetId);
      if (!staged?.uri) {
        throw new Error(PHOTO_STAGE_FAILED_MESSAGE);
      }
      return { ...asset, uri: staged.uri };
    } catch (cause) {
      if (isPhotoPickIdentityError(cause)) {
        throw cause;
      }
      throw new Error(PHOTO_STAGE_FAILED_MESSAGE);
    }
  }
  return io.copyPicker(asset, index);
}

export function pickFileExtension(fileName?: string | null, uri?: string): string {
  const named = extensionOf(fileName);
  if (named) {
    return named;
  }
  return extensionOf((uri || "").split("?")[0]) || "heic";
}

export function uniquePickFileName(
  index: number,
  ext: string,
  now = 1_700_000_000_000,
  nonce = "a1b2c3d4",
): string {
  return `getfkd-pick-${now}-${index}-${nonce}.${ext}`;
}

export async function assemblePhotoUploads(
  assets: PickedPhoto[],
  io: PhotoPrepareIO,
  onProgress?: PhotoPrepareProgress,
): Promise<PhotoUploadPart[]> {
  const unique = assertIdentifiablePicks(assets);
  const prepared: PhotoUploadPart[] = [];
  const total = unique.length;
  for (const [index, asset] of unique.entries()) {
    onProgress?.onStart?.(index, total);
    const staged = await io.stage(asset, index);
    if (io.encode) {
      const encoded = await io.encode(staged.uri);
      prepared.push(heicUploadPart(encoded.uri, index));
    } else {
      prepared.push(photoUploadFallback(staged, index));
    }
    onProgress?.onDone?.(index, total);
  }
  return prepared;
}

function extensionOf(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  const parts = trimmed.split(".");
  if (parts.length < 2) {
    return null;
  }
  const ext = parts[parts.length - 1]?.toLowerCase();
  if (!ext || !/^[a-z0-9]{2,5}$/.test(ext)) {
    return null;
  }
  return ext;
}
