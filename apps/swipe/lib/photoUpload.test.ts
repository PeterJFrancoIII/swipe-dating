import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assemblePhotoUploads,
  fitPhoneRaster,
  heicUploadPart,
  isDefaultPhotoFormat,
  photoAcceptHeader,
  photoMimeFromName,
  photoResizeAction,
  photoUploadFallback,
  pickFileExtension,
  pickIdentity,
  uniquePickFileName,
  uniquePickedPhotos,
} from "./photoGeometry.ts";

describe("fitPhoneRaster", () => {
  it("leaves a phone-sized portrait unchanged", () => {
    assert.deepEqual(fitPhoneRaster(1080, 2400), { width: 1080, height: 2400 });
  });

  it("scales a 12MP landscape into the 1080 by 2400 box", () => {
    assert.deepEqual(fitPhoneRaster(4032, 3024), { width: 1440, height: 1080 });
  });

  it("scales a 12MP portrait into the 1080 by 2400 box", () => {
    assert.deepEqual(fitPhoneRaster(3024, 4032), { width: 1080, height: 1440 });
  });

  it("does not upscale a small image", () => {
    assert.deepEqual(fitPhoneRaster(640, 480), { width: 640, height: 480 });
  });
});

describe("photo upload fallback", () => {
  it("labels an already-HEIC pick as the default upload part", () => {
    assert.deepEqual(
      photoUploadFallback(
        { uri: "file:///tmp/selfie.heic", fileName: "IMG_0001.HEIC", mimeType: "image/heic" },
        0,
      ),
      { uri: "file:///tmp/selfie.heic", name: "photo-1.heic", type: "image/heic" },
    );
  });

  it("resizes when both edges are known", () => {
    assert.deepEqual(photoResizeAction(3024, 4032), [{ resize: { width: 1080, height: 1440 } }]);
  });

  it("keeps HEIC as the iPhone 14+ type", () => {
    assert.equal(photoMimeFromName("IMG_0001.HEIC"), "image/heic");
    assert.equal(isDefaultPhotoFormat("image/jpeg", "shot.jpg"), false);
    assert.equal(isDefaultPhotoFormat("image/heic", "IMG_0001.HEIC"), true);
    assert.deepEqual(heicUploadPart("file:///tmp/out.heic", 0), {
      uri: "file:///tmp/out.heic",
      name: "photo-1.heic",
      type: "image/heic",
    });
    assert.equal(photoAcceptHeader("ios"), "image/heic,image/heif,image/avif,image/webp,*/*");
    assert.equal(photoAcceptHeader("android"), "image/avif,image/webp,*/*");
  });
});

describe("uniquePickedPhotos", () => {
  it("keeps three library items that share a picker cache URI", () => {
    const shared = "file:///tmp/ImagePicker/reused.heic";
    const unique = uniquePickedPhotos([
      { uri: shared, assetId: "A", fileName: "IMG_1.HEIC" },
      { uri: "file:///tmp/ImagePicker/b.heic", assetId: "B", fileName: "IMG_2.HEIC" },
      { uri: shared, assetId: "C", fileName: "IMG_3.HEIC" },
    ]);
    assert.deepEqual(
      unique.map((asset) => asset.assetId),
      ["A", "B", "C"],
    );
    assert.equal(pickIdentity({ uri: shared, assetId: "C" }), "id:C");
  });

  it("drops a second pick of the same library item", () => {
    assert.deepEqual(
      uniquePickedPhotos([
        { uri: "file:///tmp/a.heic", assetId: "A" },
        { uri: "file:///tmp/b.heic", assetId: "B" },
        { uri: "file:///tmp/a-again.heic", assetId: "A" },
      ]).map((asset) => asset.assetId),
      ["A", "B"],
    );
  });

  it("drops a reused cache URI when the library id is missing", () => {
    const shared = "file:///tmp/ImagePicker/reused.heic";
    assert.deepEqual(
      uniquePickedPhotos([
        { uri: shared, fileName: "IMG_1.HEIC" },
        { uri: "file:///tmp/ImagePicker/b.heic", fileName: "IMG_2.HEIC" },
        { uri: shared, fileName: "IMG_3.HEIC" },
      ]).map((asset) => asset.fileName),
      ["IMG_1.HEIC", "IMG_2.HEIC"],
    );
  });
});

describe("assemblePhotoUploads", () => {
  it("encodes the staged copy, not the reused picker URI", async () => {
    const shared = "file:///tmp/ImagePicker/reused.heic";
    const staged: string[] = [];
    const encoded: string[] = [];
    const parts = await assemblePhotoUploads(
      [
        { uri: shared, assetId: "A", fileName: "IMG_1.HEIC", mimeType: "image/heic" },
        { uri: "file:///tmp/ImagePicker/b.heic", assetId: "B", fileName: "IMG_2.HEIC", mimeType: "image/heic" },
        { uri: shared, assetId: "C", fileName: "IMG_3.HEIC", mimeType: "image/heic" },
      ],
      {
        stage: async (asset, index) => {
          const uri = `file:///tmp/staged-${index}.heic`;
          staged.push(`${asset.assetId}:${uri}`);
          return { ...asset, uri };
        },
        encode: async (uri) => {
          encoded.push(uri);
          return { uri: uri.replace("staged", "encoded") };
        },
      },
    );
    assert.deepEqual(staged, ["A:file:///tmp/staged-0.heic", "B:file:///tmp/staged-1.heic", "C:file:///tmp/staged-2.heic"]);
    assert.deepEqual(encoded, [
      "file:///tmp/staged-0.heic",
      "file:///tmp/staged-1.heic",
      "file:///tmp/staged-2.heic",
    ]);
    assert.deepEqual(
      parts.map((part) => part.uri),
      ["file:///tmp/encoded-0.heic", "file:///tmp/encoded-1.heic", "file:///tmp/encoded-2.heic"],
    );
    assert.equal(pickFileExtension("IMG_0001.HEIC", shared), "heic");
    assert.equal(uniquePickFileName(2, "heic"), "getfkd-pick-1700000000000-2-a1b2c3d4.heic");
  });
});
