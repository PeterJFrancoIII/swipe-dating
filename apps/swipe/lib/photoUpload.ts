import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { getfkdPhoto } from "getfkd-photo";

import {
  AMBIGUOUS_PHOTO_PICK_MESSAGE,
  PHOTO_STAGE_FAILED_MESSAGE,
  assemblePhotoUploads,
  assertIdentifiablePicks,
  isPhotoPickIdentityError,
  pickerUriIsUnique,
  pickFileExtension,
  resolveStagedPick,
  uniquePickFileName,
  uniquePickedPhotos,
  type PhotoPrepareProgress,
  type PhotoUploadPart,
  type PickedPhoto,
} from "@/lib/photoGeometry";

export type { PhotoUploadPart, PickedPhoto };
export {
  AMBIGUOUS_PHOTO_PICK_MESSAGE,
  PHOTO_STAGE_FAILED_MESSAGE,
  assertIdentifiablePicks,
  isPhotoPickIdentityError,
  uniquePickedPhotos,
};

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
  const unique = assertIdentifiablePicks(assets);
  if (__DEV__) {
    console.warn(
      "getfkd photo picks",
      unique.map((asset) => ({ assetId: asset.assetId, uri: asset.uri, fileName: asset.fileName })),
    );
  }
  const encoder = getfkdPhoto();
  const stageLibrary = encoder?.stagePickedPhoto?.bind(encoder);
  return assemblePhotoUploads(
    unique,
    {
      stage: (asset, index) =>
        resolveStagedPick(
          asset,
          index,
          {
            stageLibrary,
            copyPicker: copyPickedPhotoToUniqueFile,
          },
          { uniquePickerUri: pickerUriIsUnique(unique, asset.uri) },
        ),
      encode: encoder ? (uri) => encoder.encodeProfileHeic(uri) : undefined,
    },
    onProgress,
  );
}

export async function copyPickedPhotoToUniqueFile(asset: PickedPhoto, index: number): Promise<PickedPhoto> {
  const root = FileSystem.cacheDirectory;
  if (!root) {
    throw new Error(PHOTO_STAGE_FAILED_MESSAGE);
  }
  const dest = `${root}${uniquePickFileName(
    index,
    pickFileExtension(asset.fileName, asset.uri),
    Date.now(),
    Math.random().toString(16).slice(2, 10),
  )}`;
  await FileSystem.copyAsync({ from: asset.uri, to: dest });
  return { ...asset, uri: dest };
}
