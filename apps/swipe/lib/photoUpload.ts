import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { getfkdPhoto } from "getfkd-photo";

import {
  assemblePhotoUploads,
  pickFileExtension,
  uniquePickFileName,
  uniquePickedPhotos,
  type PhotoPrepareProgress,
  type PhotoUploadPart,
  type PickedPhoto,
} from "@/lib/photoGeometry";

export type { PhotoUploadPart, PickedPhoto };
export { uniquePickedPhotos };

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
  onProgress?: PhotoPrepareProgress,
): Promise<PhotoUploadPart[]> {
  const unique = uniquePickedPhotos(assets);
  if (__DEV__) {
    console.warn(
      "getfkd photo picks",
      unique.map((asset) => ({ assetId: asset.assetId, uri: asset.uri, fileName: asset.fileName })),
    );
  }
  const encoder = getfkdPhoto();
  return assemblePhotoUploads(
    unique,
    {
      stage: (asset, index) => stagePickedPhoto(asset, index, encoder),
      encode: encoder ? (uri) => encoder.encodeProfileHeic(uri) : undefined,
    },
    onProgress,
  );
}

async function stagePickedPhoto(
  asset: PickedPhoto,
  index: number,
  encoder: ReturnType<typeof getfkdPhoto>,
): Promise<PickedPhoto> {
  if (encoder && typeof encoder.stagePickedPhoto === "function") {
    try {
      const staged = await encoder.stagePickedPhoto(asset.uri, asset.assetId?.trim() || "");
      if (staged.uri) {
        return { ...asset, uri: staged.uri };
      }
    } catch {
      /* copy the picker file instead */
    }
  }
  return copyPickedPhotoToUniqueFile(asset, index);
}

export async function copyPickedPhotoToUniqueFile(asset: PickedPhoto, index: number): Promise<PickedPhoto> {
  const root = FileSystem.cacheDirectory;
  if (!root) {
    return asset;
  }
  const dest = `${root}${uniquePickFileName(
    index,
    pickFileExtension(asset.fileName, asset.uri),
    Date.now(),
    Math.random().toString(16).slice(2, 10),
  )}`;
  try {
    await FileSystem.copyAsync({ from: asset.uri, to: dest });
    return { ...asset, uri: dest };
  } catch {
    return asset;
  }
}
