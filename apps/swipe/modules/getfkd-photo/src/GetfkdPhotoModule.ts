import { requireNativeModule } from "expo";

export type EncodedProfilePhoto = {
  uri: string;
  width: number;
  height: number;
};

export type StagedPickedPhoto = {
  uri: string;
};

type GetfkdPhotoNative = {
  encodeProfileHeic(uri: string): Promise<EncodedProfilePhoto>;
  stagePickedPhoto?(uri: string, assetId: string): Promise<StagedPickedPhoto>;
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
