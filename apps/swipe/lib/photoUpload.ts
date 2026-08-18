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

export async function preparePhotoUploads(
  assets: PickedPhoto[],
  onProgress?: { onStart?: (index: number, total: number) => void; onDone?: (index: number, total: number) => void },
): Promise<PhotoUploadPart[]> {
  const encoder = getfkdPhoto();
  const prepared = [];
  const total = assets.length;
  for (const [index, asset] of assets.entries()) {
    onProgress?.onStart?.(index, total);
    if (encoder) {
      const encoded = await encoder.encodeProfileHeic(asset.uri);
      prepared.push(heicUploadPart(encoded.uri, index));
    } else {
      prepared.push(photoUploadFallback(asset, index));
    }
    onProgress?.onDone?.(index, total);
  }
  return prepared;
}
