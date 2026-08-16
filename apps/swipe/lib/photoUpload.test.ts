import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  fitPhoneRaster,
  heicUploadPart,
  isDefaultPhotoFormat,
  photoAcceptHeader,
  photoMimeFromName,
  photoResizeAction,
  photoUploadFallback,
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
