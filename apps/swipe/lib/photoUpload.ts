import * as ImagePicker from "expo-image-picker";
import { getfkdPhoto } from "getfkd-photo";

import {
  heicUploadPart,
  photoUploadFallback,
  type PhotoUploadPart,
  type PickedPhoto,
} from "@/lib/photoGeometry";

export type { PhotoUploadPart, PickedPhoto };

export function profilePhotoPickerOptions(remaining: number): ImagePicker.ImagePickerOptions {
  return {
    allowsMultipleSelection: true,
    mediaTypes: ["images"],
    selectionLimit: Math.max(1, remaining),
    preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
  };
}

export async function preparePhotoUploads(assets: PickedPhoto[]): Promise<PhotoUploadPart[]> {
  const encoder = getfkdPhoto();
  const prepared = [];
  for (const [index, asset] of assets.entries()) {
    if (encoder) {
      const encoded = await encoder.encodeProfileHeic(asset.uri);
      prepared.push(heicUploadPart(encoded.uri, index));
      continue;
    }
    prepared.push(photoUploadFallback(asset, index));
  }
  return prepared;
}
