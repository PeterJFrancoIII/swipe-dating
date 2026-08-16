import { requireNativeModule } from "expo";

export type EncodedProfilePhoto = {
  uri: string;
  width: number;
  height: number;
};

type GetfkdPhotoNative = {
  encodeProfileHeic(uri: string): Promise<EncodedProfilePhoto>;
};

let cached: GetfkdPhotoNative | null | undefined;

export function getfkdPhoto(): GetfkdPhotoNative | null {
  if (cached !== undefined) {
    return cached;
  }
  try {
    cached = requireNativeModule<GetfkdPhotoNative>("GetfkdPhoto");
  } catch {
    cached = null;
  }
  return cached;
}
