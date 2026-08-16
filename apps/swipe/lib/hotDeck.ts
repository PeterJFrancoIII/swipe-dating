import { api, mediaHeaders, mediaUrl } from "@/lib/api";
import type { Candidate, DiscoverPack, DiscoverState } from "@/lib/types";

const MAX_CACHED_PHOTOS = 6;
const MAX_CACHED_BYTES = 8 * 1024 * 1024;

const photoRam = new Map<string, string>();
let cachedBytes = 0;

export function resolvedMediaUri(path: string): string {
  if (!path) {
    return path;
  }
  if (path.startsWith("data:")) {
    return path;
  }
  return photoRam.get(path) ?? (path.startsWith("http") ? path : mediaUrl(path));
}

export async function loadDiscoverPack(photo = 0): Promise<DiscoverState> {
  const pack = await api.discoverPack(photo);
  if (pack.candidate) {
    void prefetchCandidatePhotos(pack.candidate, 1);
  }
  const ahead = pack.window[1];
  if (ahead) {
    void prefetchCandidatePhotos(ahead, 1);
  }
  return pack;
}

export async function prefetchCandidatePhotos(candidate: Candidate, slots = 1): Promise<void> {
  await Promise.all(candidate.photos.slice(0, Math.max(0, slots)).map((path) => cachePhoto(path)));
}

export async function loadAuthedPhoto(path: string): Promise<string> {
  return cachePhoto(path);
}

async function cachePhoto(path: string): Promise<string> {
  const hit = photoRam.get(path);
  if (hit) {
    photoRam.delete(path);
    photoRam.set(path, hit);
    return hit;
  }
  const response = await fetch(mediaUrl(path), { headers: mediaHeaders() });
  if (!response.ok) {
    return mediaUrl(path);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const mime = response.headers.get("content-type") || "image/avif";
  const uri = `data:${mime};base64,${bytesToBase64(bytes)}`;
  rememberPhoto(path, uri);
  return uri;
}

function rememberPhoto(path: string, uri: string): void {
  const size = uri.length;
  if (size > MAX_CACHED_BYTES) {
    return;
  }
  evictWhile(photoRam.size >= MAX_CACHED_PHOTOS || cachedBytes + size > MAX_CACHED_BYTES);
  photoRam.set(path, uri);
  cachedBytes += size;
}

function evictWhile(needed: boolean): void {
  while (needed && photoRam.size > 0) {
    const oldest = photoRam.keys().next().value;
    if (!oldest) {
      return;
    }
    const value = photoRam.get(oldest) ?? "";
    photoRam.delete(oldest);
    cachedBytes = Math.max(0, cachedBytes - value.length);
    needed = photoRam.size >= MAX_CACHED_PHOTOS || cachedBytes > MAX_CACHED_BYTES;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const step = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += step) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + step));
  }
  return btoa(binary);
}

export type { DiscoverPack };
